import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GenerateExcel } from 'src/config/excel/main';

@Module({
  controllers: [UsersController],
  providers: [UsersService, GenerateExcel],
  exports: [UsersService],
})
export class UsersModule {}
