import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from './config/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  providers: [{ 
    provide: APP_GUARD,
    useClass: RolesGuard
  }],
  imports: [ConfigModule.forRoot({ isGlobal: true, 
    envFilePath: 
      process.env.NODE_ENV === 'production' ? '.env.production' : '.env' }), 
    PrismaModule],
})
export class AppModule {}
