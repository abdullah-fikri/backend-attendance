import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  CreateClockOutDto,
} from './dto/create-attendance.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('attendance')
@Roles('EMPLOYEE')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @ResponseMessage('Created Attendance successfully')
  async clockIn(@Req() req, @Body() body: CreateAttendanceDto) {
    const userId = req.user?.userId;

    const { latIn, longIn } = body;
    if (latIn == null || longIn == null) {
      throw new BadRequestException('Latitude and Longitude are required');
    }

    return this.attendanceService.clockIn(userId, body);
  }

  @Post('clock-out')
  @ResponseMessage('Updated Attendance successfully')
  async ClockOut(@Req() req, @Body() body: CreateClockOutDto) {
    const userId = req.user?.userId;
    const { latOut, longOut } = body;

    if (latOut == null || longOut == null) {
      throw new BadRequestException('Latitude and Longitude are required');
    }

    return this.attendanceService.clockOut(userId, body);
  }

  @Get('today')
  @ResponseMessage('Get Attendance today success')
  @Roles('EMPLOYEE')
  async findOne(@Req() req) {
    return this.attendanceService.findOne(req.user.userId);
  }
}