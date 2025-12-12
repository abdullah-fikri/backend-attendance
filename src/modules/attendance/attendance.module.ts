import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtConfigModule } from 'src/config/JwtConfigModule';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [PassportModule, JwtConfigModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, JwtStrategy],
})
export class AttendanceModule {}
