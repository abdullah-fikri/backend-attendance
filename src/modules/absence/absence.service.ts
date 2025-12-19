import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbsenceStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/config/prisma.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAbsenceDto, file?: any) {
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

    return absence;
  }

  async reject(id: string, dto: { reason?: string }) {
    const absence = await this.prisma.absenceRequest.findUnique({
      where: { id },
    });

    if (!absence) {
      throw new NotFoundException('Absence request not found');
    }

    if (absence.status !== AbsenceStatus.PENDING) {
      throw new BadRequestException(`Absence already ${absence.status}`);
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
}
