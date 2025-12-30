import { Module } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { AbsenceController } from './absence.controller';
import { GenerateExcel } from 'src/config/excel/main';

@Module({
  controllers: [AbsenceController],
  providers: [AbsenceService, GenerateExcel],
})
export class AbsenceModule {}
