import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateExcel } from 'src/config/excel/main';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  CreateClockOutDto,
} from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly excelService: GenerateExcel,
  ) {}

  @Post('clock-in')
  @ResponseMessage('Created Attendance successfully')
  async clockIn(@Req() req, @Body() body: CreateAttendanceDto) {
    const userId = req.user?.userId;

    const { latIn, longIn } = body;
    if (latIn == null || longIn == null) {
      throw new BadRequestException('Latitude and Longitude are required');
    }

    if (Number.isNaN(latIn) || Number.isNaN(longIn)) {
      throw new BadRequestException('Latitude and Longitude must be numbers');
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
  @Roles('EMPLOYEE', 'ADMIN')
  async findOne(@Req() req) {
    const { userId, role } = req.user;
    return this.attendanceService.findToday({ userId, role });
  }

  @Get('export')
  @Roles('ADMIN')
  async generatedExcelAttendace(@Res() res: Response) {
    const workbook = await this.attendanceService.exportAttendace();
    await this.excelService.WriteToResponse(
      workbook,
      res,
      'data-attendace.xlsx',
    );
  }
}
