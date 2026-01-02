import { Module } from '@nestjs/common';
import { EmailModule } from 'src/config/email/email.module';
import { GenerateExcel } from 'src/config/excel/main';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';

@Module({
  imports: [EmailModule],
  controllers: [AbsenceController],
  providers: [AbsenceService, GenerateExcel],
})
export class AbsenceModule {}
