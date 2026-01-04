import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AbsenceStatus } from '@prisma/client';
import { EmailService } from 'src/config/email/email.service';
import { AbsenceExcel } from 'src/config/excel/absenceRequests.worksheet';
import { GenerateExcel } from 'src/config/excel/main';
import { PrismaService } from 'src/config/prisma.service';
import { deleteFileFromS3 } from 'src/config/s3/s3.delete';
import { CreateAbsenceDto } from './dto/create-absence.dto';

@Injectable()
export class AbsenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly excelService: GenerateExcel,
    private readonly emailService: EmailService,
  ) {}

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

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  private calculateDuration(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return (
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  }

  async reject(id: string, dto: { reason?: string }) {
    const absence = await this.prisma.absenceRequest.findUnique({
      where: { id },
      include: { user: true },
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

    const duration = this.calculateDuration(absence.startDate, absence.endDate);

    // Delete attachment file from S3 if exists
    if (absence.attachmentUrl) {
      try {
        await deleteFileFromS3(absence.attachmentUrl);
        console.log(`Deleted attachment for rejected absence: ${id}`);
      } catch (error) {
        console.error('Failed to delete attachment from S3:', error);
      }
    }

    // Send rejection email
    try {
      await this.emailService.sendAbsenceRejectedEmail({
        email: absence.user.email,
        userName: absence.user.fullName,
        absenceType: absence.type,
        startDate: this.formatDate(absence.startDate),
        endDate: this.formatDate(absence.endDate),
        duration,
        reason: absence.reason,
        rejectionReason: dto.reason,
      });
    } catch (error) {
      console.error('Failed to send rejection email:', error);
    }

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
      include: { user: true },
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

    let updatedUser;

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

      updatedUser = await tx.user.update({
        where: { id: absence.userId },
        data: {
          leaveBalance: { decrement: leaveDays },
        },
      });
    });

    // Send approval email
    try {
      await this.emailService.sendAbsenceApprovedEmail({
        email: absence.user.email,
        userName: absence.user.fullName,
        absenceType: absence.type,
        startDate: this.formatDate(absence.startDate),
        endDate: this.formatDate(absence.endDate),
        duration: leaveDays,
        reason: absence.reason,
        remainingBalance: updatedUser.leaveBalance,
      });
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }

    return {
      success: true,
      message: 'Absence approved successfully',
      data: {
        id: absence.id,
        status: AbsenceStatus.APPROVED,
        updatedAt: new Date(),
      },
    };
  }

  async exportAbsence() {
    const absences = await this.prisma.absenceRequest.findMany({
      include: { user: true },
    });

    const workbook = this.excelService.createWorkBook();

    const worksheet = workbook.addWorksheet('Absence');

    AbsenceExcel(worksheet);

    absences.forEach((absence, i) => {
      worksheet.addRow({
        id: i + 1,
        fullname: absence.user.fullName,
        type: absence.type,
        startDate: absence.startDate,
        endDate: absence.endDate,
        reason: absence.reason,
        attachmentUrl: absence.attachmentUrl,
        status: absence.status,
      });
    });
    return workbook;
  }
}
