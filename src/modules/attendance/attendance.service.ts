import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/config/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}
  create(createAttendanceDto: CreateAttendanceDto) {
    return 'This action adds a new attendance';
  }

  findAll() {
    return `This action returns all attendance`;
  }

  async findOne(id: string) {
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
        id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: true
      }
    });

    if (!attendance) {
      throw new HttpException(
        {
          message: 'not found with the user',
          data: {
            date: start.toISOString().split('T')[0],
            status: 'ABSENT',
            clockInTime: null,
            clockOutTime: null
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
          long: attendance.longIn
        },
        clockOut: {
          lat: attendance.latOut,
          long: attendance.longOut
        }
      }
    };
  }

  update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    return `This action updates a #${id} attendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}
