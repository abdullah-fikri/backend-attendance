import { Controller, Get, Req } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { th } from '@faker-js/faker/.';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Get('history')
  @ResponseMessage('Successfuly get list history absence')
  async listHistoryAbsence(@Req() req) {
    const userId = req.user?.userId;

    return this.absenceService.history(userId);
  }
}
