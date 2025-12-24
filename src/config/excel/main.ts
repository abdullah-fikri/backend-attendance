import { Injectable } from '@nestjs/common';
import * as ExcelJs from 'exceljs';

@Injectable()
export class GenerateExcel {
  createWorkBook() {
    return new ExcelJs.Workbook();
  }

  async WriteToResponse(Workbook: ExcelJs.Workbook, res, filename = 'data.xlsx') {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    await Workbook.xlsx.write(res)
    res.end()
  }
}
