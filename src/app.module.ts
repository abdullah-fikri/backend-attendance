import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';
import { UsersModule } from './modules/users/users.module';
import { JwtConfigModule } from './config/JwtConfigModule';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    JwtConfigModule,
    ProfileModule,
  ],
})
export class AppModule {}
