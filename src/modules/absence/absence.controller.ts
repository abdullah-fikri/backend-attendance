import { Body, Controller, Get,Post, Req,  UploadedFile,
  UseInterceptors, } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { th } from '@faker-js/faker/.';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerS3Config } from 'src/upload/upload.multer';


@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment', multerS3Config))
  @ResponseMessage('Absence request submitted successfully')
  async createAbsence(
    @Req() req,
    @UploadedFile() file: any,
    @Body() dto: CreateAbsenceDto,
  ) {
    const userId = req.user.userId;

    return this.absenceService.create(userId, dto, file);
  }

  @Get('history')
  @ResponseMessage('Successfuly get list history absence')
  async listHistoryAbsence(@Req() req) {
    const userId = req.user?.userId;

    return this.absenceService.history(userId);
  }
}
