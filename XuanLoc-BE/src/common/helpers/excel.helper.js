import ExcelJS from "exceljs";

// Sinh và stream 1 file .xlsx trực tiếp về response, dùng chung cho các báo cáo export.
export const sendExcelFile = async (res, { fileName, sheetName, columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  await workbook.xlsx.write(res);
  res.end();
};
