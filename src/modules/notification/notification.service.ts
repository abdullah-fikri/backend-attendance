import { Injectable } from '@nestjs/common';
import { AbsenceStatus } from 'generated/prisma/enums';
import { STATUS_CODES } from 'http';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class NotificationService {  constructor(private readonly prisma: PrismaService) {}

  async getUnreadCount() {
    const unread = await this.prisma.absenceRequest.count({
      where: {
        status: AbsenceStatus.PENDING,
      },
    });
    
    return unread
  }
}
