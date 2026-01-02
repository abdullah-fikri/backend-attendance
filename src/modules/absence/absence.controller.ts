import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateExcel } from 'src/config/excel/main';
import { multerS3Config } from 'src/upload/upload.multer';
import { AbsenceService } from './absence.service';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { RejectAbsenceDto } from './dto/reject-absence.dto';

@Controller('absence')
export class AbsenceController {
  constructor(
    private readonly absenceService: AbsenceService,
    private readonly excelService: GenerateExcel,
  ) {}

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

  @Get('export')
  @Roles('ADMIN')
  async generatedExcelAbsence(@Res() res: Response) {
    const workbook = await this.absenceService.exportAbsence();
    await this.excelService.WriteToResponse(workbook, res, 'data-absence.xlsx');
  }

  @Put(':id/reject')
  @Roles('ADMIN')
  async rejectAbsence(@Param('id') id: string, @Body() dto: RejectAbsenceDto) {
    return this.absenceService.reject(id, dto);
  }

  @Put(':id/approve')
  @Roles('ADMIN')
  async approveAbsence(@Param('id') id: string) {
    return this.absenceService.approve(id);
  }
}
