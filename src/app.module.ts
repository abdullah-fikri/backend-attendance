import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/role.guard';
import { JwtConfigModule } from './config/JwtConfigModule';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UsersModule } from './modules/users/users.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AbsenceModule } from './modules/absence/absence.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    providers: [
    {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { 
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AttendanceModule,
    JwtConfigModule,
    ProfileModule,
    AttendanceModule,
    AbsenceModule,
    NotificationModule,
    ReportsModule,
  ],
})
export class AppModule {}
