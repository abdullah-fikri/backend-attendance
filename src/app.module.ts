import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from './config/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, 
    envFilePath: 
      process.env.NODE_ENV === 'production' ? '.env.production' : '.env' }), 
    PrismaModule],
})
export class AppModule {}
