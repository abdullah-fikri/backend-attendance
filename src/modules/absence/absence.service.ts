import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { UpdateAbsenceDto } from './dto/update-absence.dto';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class AbsenceService {
  constructor(private readonly prisma: PrismaService) {}
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
