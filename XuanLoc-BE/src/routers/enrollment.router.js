import express from "express";
import { enrollmentController } from "../controllers/enrollment.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const enrollmentRouter = express.Router();

// ==========================================
// 1. STATIC & SELF-SERVICE ROUTES
// ==========================================

// Học viên xem các lớp mình đăng ký
enrollmentRouter.get(
  "/my-enrollments",
  protect,
  checkRole("student"),
  enrollmentController.getMyEnrollments,
);

// Học viên tự bấm đăng ký vào lớp
enrollmentRouter.post(
  "/register",
  protect,
  checkRole("student"),
  enrollmentController.registerClassByStudent,
);

// Admin lập phiếu thu tiền mặt
enrollmentRouter.post(
  "/payments/cash",
  protect,
  checkRole("admin"),
  enrollmentController.createCashPayment,
);

// Xem lịch sử đóng tiền theo Enrollment ID
enrollmentRouter.get(
  "/:enrollmentId/payments",
  protect,
  enrollmentController.getPaymentsByEnrollment,
);

// Admin: báo cáo công nợ học phí toàn trung tâm
enrollmentRouter.get(
  "/debt-report",
  protect,
  checkRole("admin"),
  enrollmentController.getDebtReport,
);
enrollmentRouter.get(
  "/debt-report/export",
  protect,
  checkRole("admin"),
  enrollmentController.exportDebtReport,
);
enrollmentRouter.post(
  "/debt-report/send-reminders",
  protect,
  checkRole("admin"),
  enrollmentController.sendTuitionReminders,
);

// Giáo viên (lớp mình dạy) / Admin: danh sách học viên active của 1 lớp kèm enrollment_id
// (dùng để nhập điểm - đặt trước "/:id/..." để không bị nuốt bởi route động)
enrollmentRouter.get(
  "/by-class/:classId",
  protect,
  checkRole("teacher", "admin"),
  enrollmentController.getEnrollmentsByClass,
);

// Admin xem danh sách tất cả ghi danh
enrollmentRouter.get(
  "/",
  protect,
  checkRole("admin"),
  enrollmentController.getAllEnrollments,
);

// Admin xếp lớp thủ công cho học viên
enrollmentRouter.post(
  "/",
  protect,
  checkRole("admin"),
  enrollmentController.createEnrollment,
);

// ==========================================
// 2. DYNAMIC ROUTES (Có tham số :id)
// ==========================================

// Xem công nợ học phí (student chỉ xem của mình, admin/teacher xem mọi enrollment)
enrollmentRouter.get(
  "/:id/balance",
  protect,
  enrollmentController.getEnrollmentBalance,
);

// Lấy mã VietQR để chuyển khoản học phí còn thiếu (student chỉ lấy của mình, admin/teacher lấy mọi enrollment)
enrollmentRouter.get(
  "/:id/transfer-qr",
  protect,
  enrollmentController.getTransferQr,
);

// Admin đổi trạng thái học tập (active / dropped / completed)
enrollmentRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  enrollmentController.updateEnrollmentStatus,
);

// Admin: miễn giảm học phí
enrollmentRouter.patch(
  "/:id/discount",
  protect,
  checkRole("admin"),
  enrollmentController.setDiscount,
);

// Admin: áp mã voucher
enrollmentRouter.post(
  "/:id/apply-voucher",
  protect,
  checkRole("admin"),
  enrollmentController.applyVoucher,
);

// Hoàn học phí (tạo: admin; xem: chủ sở hữu hoặc admin/teacher)
enrollmentRouter.post(
  "/:id/refunds",
  protect,
  checkRole("admin"),
  enrollmentController.createRefund,
);
enrollmentRouter.get(
  "/:id/refunds",
  protect,
  enrollmentController.getRefunds,
);

// Admin xóa ghi danh
enrollmentRouter.delete(
  "/:id",
  protect,
  checkRole("admin"),
  enrollmentController.deleteEnrollment,
);

export default enrollmentRouter;
