import PDFDocument from "pdfkit";

// Sinh PDF chứng chỉ hoàn thành khóa học và stream trực tiếp về response.
export const buildCertificatePdf = (res, { studentName, courseTitle, certificateCode, issuedAt }) => {
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="chung-chi-${certificateCode}.pdf"`);
  doc.pipe(res);

  const { width, height } = doc.page;

  doc
    .lineWidth(3)
    .strokeColor("#0d6efd")
    .rect(30, 30, width - 60, height - 60)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor("#0d6efd")
    .rect(40, 40, width - 80, height - 80)
    .stroke();

  doc
    .fontSize(28)
    .fillColor("#0d6efd")
    .text("TRUNG TÂM NGOẠI NGỮ XUÂN LỘC", 0, 90, { align: "center" });

  doc
    .fontSize(22)
    .fillColor("#333")
    .text("CHỨNG NHẬN HOÀN THÀNH KHÓA HỌC", 0, 150, { align: "center" });

  doc
    .fontSize(14)
    .fillColor("#555")
    .text("Chứng nhận rằng", 0, 210, { align: "center" });

  doc
    .fontSize(26)
    .fillColor("#000")
    .text(studentName, 0, 240, { align: "center" });

  doc
    .fontSize(14)
    .fillColor("#555")
    .text("đã hoàn thành khóa học", 0, 290, { align: "center" });

  doc
    .fontSize(20)
    .fillColor("#0d6efd")
    .text(courseTitle, 0, 320, { align: "center" });

  const issuedDateStr = new Date(issuedAt).toLocaleDateString("vi-VN");
  doc
    .fontSize(11)
    .fillColor("#777")
    .text(`Mã chứng chỉ: ${certificateCode}    |    Ngày cấp: ${issuedDateStr}`, 0, height - 90, {
      align: "center",
    });

  doc.end();
};
