import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = `"Trung Tâm Ngoại Ngữ Xuân Lộc" <${process.env.EMAIL_USER}>`;

const wrapEmail = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #0d6efd;">Trung Tâm Ngoại Ngữ Xuân Lộc</h2>
    ${bodyHtml}
    <hr />
    <p style="font-size: 12px; color: #777;">Email này được gửi tự động, vui lòng không phản hồi.</p>
  </div>
`;

export const sendMail = async ({ to, subject, html }) => {
  return await transporter.sendMail({ from: FROM, to, subject, html });
};

export const sendResetPasswordEmail = async (toEmail, codeChangePass) => {
  return await sendMail({
    to: toEmail,
    subject: "Mã xác nhận đặt lại mật khẩu - Trung Tâm Ngoại Ngữ Xuân Lộc",
    html: wrapEmail(
      "Đặt lại mật khẩu",
      `
      <p>Xin chào,</p>
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản học viên/giáo viên tại hệ thống.</p>
      <p>Mã xác nhận (OTP) của bạn là:</p>
      <div style="font-size: 24px; font-weight: bold; color: #d9534f; padding: 10px; background: #f8f9fa; border-radius: 5px; width: fit-content;">
        ${codeChangePass}
      </div>
      <p style="margin-top: 15px;">Mã này có hiệu lực trong thời gian ngắn. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
    `,
    ),
  });
};

export const sendConsecutiveAbsenceEmail = async (toEmail, { studentName, className, absentStreak }) => {
  return await sendMail({
    to: toEmail,
    subject: `Cảnh báo vắng học liên tiếp - Lớp ${className}`,
    html: wrapEmail(
      "Cảnh báo vắng học",
      `
      <p>Xin chào ${studentName},</p>
      <p>Bạn đã vắng học <b>${absentStreak} buổi liên tiếp</b> tại lớp <b>${className}</b>.</p>
      <p>Vui lòng liên hệ trung tâm để được hỗ trợ nếu có khó khăn trong việc học tập.</p>
    `,
    ),
  });
};

export const sendNewGradeEmail = async (toEmail, { studentName, className, title, score }) => {
  return await sendMail({
    to: toEmail,
    subject: `Bạn có điểm mới - Lớp ${className}`,
    html: wrapEmail(
      "Điểm số mới",
      `
      <p>Xin chào ${studentName},</p>
      <p>Bạn vừa có điểm mới cho bài <b>${title}</b> tại lớp <b>${className}</b>:</p>
      <div style="font-size: 24px; font-weight: bold; color: #198754;">${score}</div>
    `,
    ),
  });
};

export const sendScheduleChangedEmail = async (toEmail, { studentName, className, sessionDate, startTime, endTime, room }) => {
  return await sendMail({
    to: toEmail,
    subject: `Lịch học thay đổi - Lớp ${className}`,
    html: wrapEmail(
      "Lịch học thay đổi",
      `
      <p>Xin chào ${studentName},</p>
      <p>Lịch học của lớp <b>${className}</b> vừa được cập nhật:</p>
      <ul>
        <li>Ngày: ${sessionDate}</li>
        <li>Giờ: ${startTime} - ${endTime}</li>
        <li>Phòng: ${room}</li>
      </ul>
    `,
    ),
  });
};

export const sendTuitionReminderEmail = async (toEmail, { studentName, className, balanceDue }) => {
  return await sendMail({
    to: toEmail,
    subject: `Nhắc đóng học phí - Lớp ${className}`,
    html: wrapEmail(
      "Nhắc đóng học phí",
      `
      <p>Xin chào ${studentName},</p>
      <p>Bạn còn thiếu <b>${Number(balanceDue).toLocaleString("vi-VN")}đ</b> học phí cho lớp <b>${className}</b>.</p>
      <p>Vui lòng đóng học phí sớm để không ảnh hưởng đến quá trình học tập.</p>
    `,
    ),
  });
};
