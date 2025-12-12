import { Controller, Post, Body, Req, BadRequestException, HttpException, UnauthorizedException, } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('attendance')
@Roles("EMPLOYEE")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @ResponseMessage("Created Attendance successfully")
  async clockIn(@Req() req, @Body() body: CreateAttendanceDto) {
    const userId = req.user?.userId;
    
    const { latIn, longIn } = body;
    if (latIn == null || longIn == null) {
      throw new BadRequestException('Latitude and Longitude are required');
    }

    return this.attendanceService.clockIn(userId, body);
}
}
  