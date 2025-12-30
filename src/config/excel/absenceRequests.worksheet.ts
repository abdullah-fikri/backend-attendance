import { Worksheet } from 'exceljs';

export const AbsenceExcel = (worksheet: Worksheet) => {
  worksheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Fullname', key: 'fullname', width: 30 },
    { header: 'Type', key: 'type', width: 30 },
    { header: 'Start-date',  key: 'startDate', width: 30 },
    { header: 'End-date', key: 'endDate', width: 30 },
    { header: 'Reason', key: 'reason', width: 30 },
    { header: 'Attachment-url', key: 'attachmentUrl', width: 30 },
    { header: 'Status', key: 'status', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true };

  worksheet.getRow(1).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
};
