import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { PrismaService } from 'src/config/prisma.service';
import { AbsenceStatus } from 'generated/prisma/enums';
import { da, th } from '@faker-js/faker/.';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateAbsenceDto,
    file?: any,
  ) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new HttpException(
        { message: 'startDate must be before endDate' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // cek overlap absence
    const overlap = await this.prisma.absenceRequest.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlap) {
      throw new HttpException(
        { message: 'absence request already exists in selected date range' },
        HttpStatus.CONFLICT,
      );
    }

    return this.prisma.absenceRequest.create({
      data: {
        userId,
        type: dto.type,
        startDate,
        endDate,
        reason: dto.reason,
        attachmentUrl: file?.location ?? null, 
      },
    });
  }

  async history(userId: string) {
    const absence = await this.prisma.absenceRequest.findMany({
      where: { userId },
    });

    if (absence.length === 0) {
      throw new HttpException(
              {
                message: 'user has not yet checked in',
              },
              HttpStatus.NOT_FOUND,
            );
    }

    return absence
  }

  
  async reject(id: string, dto: { reason?: string }) {
    const absence = await this.prisma.absenceRequest.findUnique({
      where: { id },
    });

    if (!absence) {
      throw new NotFoundException('Absence request not found');
    }

    if (absence.status !== AbsenceStatus.PENDING) {
      throw new BadRequestException(
        `Absence already ${absence.status}`,
      );
    }

    const updated = await this.prisma.absenceRequest.update({
      where: { id },
      data: {
        status: AbsenceStatus.REJECTED,
      },
    });

    return {
      success: true,
      message: 'Absence rejected successfully',
      data: {
        id: updated.id,
        status: updated.status,
        rejectedReason: dto.reason || 'No reason provided',
        updatedAt: updated.updatedAt,
      },
    };
  }
  
  async approve(id: string) {
    const absence = await this.prisma.absenceRequest.findUnique({
      where: { id },
    });
  
    if (!absence) {
      throw new NotFoundException('Absence request not found');
    }
  
    if (absence.status !== AbsenceStatus.PENDING) {
      throw new BadRequestException(`Absence already ${absence.status}`);
    }
  
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
  
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    const leaveDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: absence.userId },
      });
  
      if (!user || user.leaveBalance < leaveDays) {
        throw new BadRequestException('Leave balance is not sufficient');
      }
  
      await tx.absenceRequest.update({
        where: { id },
        data: {
          status: AbsenceStatus.APPROVED,
        },
      });
  
      await tx.user.update({
        where: { id: absence.userId },
        data: {
          leaveBalance: { decrement: leaveDays },
        },
      });
    });
  
    return {
      success : true,
      message : 'Absence approved successfully',
      data : {
        id: absence.id,
        status: AbsenceStatus.APPROVED,
        updatedAt: new Date(),
      }
    }
  }
}
