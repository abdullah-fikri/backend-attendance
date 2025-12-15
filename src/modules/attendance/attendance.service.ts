import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AttendanceStatus } from 'generated/prisma/enums';
import { haversineDistance } from 'src/common/utils/haversine.util';
import { PrismaService } from 'src/config/prisma.service';
import { CreateAttendanceDto, CreateClockOutDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // --- CLOCK IN ---
  async clockIn(userId: string, createAttendanceDto: CreateAttendanceDto) {
    const { latIn, longIn } = createAttendanceDto;
    const officeLat = Number(Number(process.env.OFFICE_LAT).toFixed(8));
    const officeLong = Number(Number(process.env.OFFICE_LONG).toFixed(8));
    const officeRadius = Number(process.env.OFFICE_RADIUS || '');

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

  async clockOut(userId: string, CreateClockOutDto: CreateClockOutDto) {
    const { latOut, longOut } = CreateClockOutDto;
    const officeLat = parseFloat(process.env.OFFICE_LAT || '');
    const officeLong = parseFloat(process.env.OFFICE_LONG || '');
    const officeRadius = parseInt(process.env.OFFICE_RADIUS || '');

    const distance = haversineDistance(
      latOut,
      longOut,
      officeLat,
      officeLong,
    );

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
    if (!existing) {
      throw new BadRequestException(
        "You haven't clocked in yet, please clock in first.",
      );
    }

    // --- SET STATUS ---
    const now = new Date();
    const officeStartHour = 9;

    // --- UPDATE ATTENDANCE ---
    const attendance = await this.prisma.attendance.update({
      where: { id: existing.id },
      data: {
        userId,
        date: today,
        clockOutTime: now,
        latOut,
        longOut,
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

  // get attendance today
  async findOne(userId: string) {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true,
      },
    });

    if (!attendance) {
      throw new HttpException(
        {
          message: 'not found with the user',
          data: {
            date: start.toISOString().split('T')[0],
            status: 'ABSENT',
            clockInTime: null,
            clockOutTime: null,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      fullName: attendance.user.fullName,
      date: attendance.date,
      status: attendance.status,
      clockInTime: attendance.clockInTime,
      clockOutTime: attendance.clockOutTime,
      location: {
        clockIn: {
          lat: attendance.latIn,
          long: attendance.longIn,
        },
        clockOut: {
          lat: attendance.latOut,
          long: attendance.longOut,
        },
      },
    };
  }
}
