import { Worksheet } from 'exceljs';

export const UserExcel = (worksheet: Worksheet) => {
  worksheet.columns = [
    { header: 'Id', key: 'id', width: 10 },
    { header: 'Fullname', key: 'fullname', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Role', key: 'role', width: 30 },
  ];

  worksheet.getRow(1).font = { bold: true };

  worksheet.getRow(1).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
};
