import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { PrismaService } from 'src/config/prisma.service';

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
}
