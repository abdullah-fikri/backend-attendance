import { Worksheet } from 'exceljs';

export const AttendaceExcel = (worksheet: Worksheet) => {
  worksheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Fullname', key: 'fullname', width: 30 },
    { header: 'Clock-in', key: 'clockIn', width: 30 },
    { header: 'Clock-out',  key: 'clockOut', width: 30 },
    { header: 'Status', key: 'status', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true };

  worksheet.getRow(1).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
};
