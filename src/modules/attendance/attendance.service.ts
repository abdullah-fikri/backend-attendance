import {
  BadRequestException,
  ForbiddenException,
  HttpException, HttpStatus, Injectable,
} from '@nestjs/common';
import { AttendanceStatus } from 'generated/prisma/enums';
import { haversineDistance } from 'src/common/utils/haversine.util';
import { PrismaService } from 'src/config/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // --- CLOCK IN ---
  async clockIn(userId: string, createAttendanceDto: CreateAttendanceDto) {
    const { latIn, longIn } = createAttendanceDto;
    const officeLat = parseFloat(process.env.OFFICE_LAT || '');
    const officeLong = parseFloat(process.env.OFFICE_LONG || '');
    const officeRadius = parseInt(process.env.OFFICE_RADIUS || '');

    const distance = haversineDistance(latIn, longIn, officeLat, officeLong);

    if (distance > officeRadius) {
      throw new ForbiddenException(
        `You are outside the attendance radius. Distance: ${distance.toFixed()} meters. Radius max: ${officeRadius} meters.`,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: today,
      },
    });
    if (existing) {
      throw new BadRequestException('You ve already clocked in today');
    }

    // --- SET STATUS ---
    const now = new Date();
    const officeStartHour = 9;
    const status =
      now.getHours() < officeStartHour
        ? AttendanceStatus.ON_TIME
        : AttendanceStatus.LATE;

    // --- SAVE ATTENDANCE ---
    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        date: today,
        clockInTime: now,
        latIn,
        longIn,
        status,
      },
      // --- SET RESPONSE ---
      select: {
        id: true,
        userId: true,
        date: true,
        clockInTime: true,
        clockOutTime: true,
        latIn: true,
        longIn: true,
        latOut: true,
        longOut: true,
        status: true,
      },
    });

    return attendance;
  }
}
