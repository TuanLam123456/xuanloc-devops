import { enrollmentService } from "../services/enrollment.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
import { sendExcelFile } from "../common/helpers/excel.helper.js";

export const enrollmentController = {
  // Student Controllers
  getMyEnrollments: async (req, res, next) => {
    try {
      const enrollments = await enrollmentService.getMyEnrollments(req.user.id);
      res
        .status(200)
        .json(
          responseSuccess(
            enrollments,
            "Lấy danh sách lớp đã đăng ký thành công.",
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  registerClassByStudent: async (req, res, next) => {
    try {
      const { class_id } = req.body;
      const result = await enrollmentService.registerClassByStudent(
        req.user.id,
        class_id,
      );
      const message = result?.waitlisted
        ? "Lớp học đã đầy, bạn đã được thêm vào danh sách chờ."
        : "Đăng ký lớp học thành công.";
      res.status(201).json(responseSuccess(result, message, 201));
    } catch (error) {
      next(error);
    }
  },

  // Admin Controllers
  getAllEnrollments: async (req, res, next) => {
    try {
      const enrollments = await enrollmentService.getAllEnrollmentsByAdmin(
        req.query,
      );
      res
        .status(200)
        .json(
          responseSuccess(
            enrollments,
            "Lấy danh sách quản lý ghi danh thành công.",
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  getEnrollmentsByClass: async (req, res, next) => {
    try {
      const enrollments = await enrollmentService.getEnrollmentsByClassForTeacher(
        req.params.classId,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(enrollments, "Lấy danh sách học viên của lớp thành công."));
    } catch (error) {
      next(error);
    }
  },

  createEnrollment: async (req, res, next) => {
    try {
      const newEnrollment = await enrollmentService.createEnrollmentByAdmin(
        req.body,
      );
      res
        .status(201)
        .json(
          responseSuccess(
            newEnrollment,
            "Xếp học viên vào lớp thành công.",
            201,
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  updateEnrollmentStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const updatedEnrollment =
        await enrollmentService.updateEnrollmentStatusByAdmin(
          req.params.id,
          status,
          req.user,
        );
      res
        .status(200)
        .json(
          responseSuccess(
            updatedEnrollment,
            "Cập nhật trạng thái ghi danh thành công.",
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  deleteEnrollment: async (req, res, next) => {
    try {
      await enrollmentService.deleteEnrollmentByAdmin(req.params.id, req.user);
      res
        .status(200)
        .json(responseSuccess(null, "Xóa lượt ghi danh thành công."));
    } catch (error) {
      next(error);
    }
  },

  // Payment Controllers (Tiền mặt)
  createCashPayment: async (req, res, next) => {
    try {
      const payment = await enrollmentService.createCashPaymentByAdmin(
        req.body,
        req.user,
      );
      res
        .status(201)
        .json(
          responseSuccess(payment, "Lập phiếu thu tiền mặt thành công.", 201),
        );
    } catch (error) {
      next(error);
    }
  },

  getTransferQr: async (req, res, next) => {
    try {
      const qr = await enrollmentService.getTransferQrByEnrollment(
        req.params.id,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(qr, "Lấy mã QR chuyển khoản thành công."));
    } catch (error) {
      next(error);
    }
  },

  getPaymentsByEnrollment: async (req, res, next) => {
    try {
      const payments = await enrollmentService.getPaymentsByEnrollment(
        req.params.enrollmentId,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(payments, "Lấy lịch sử thu tiền thành công."));
    } catch (error) {
      next(error);
    }
  },

  // Công nợ học phí
  getEnrollmentBalance: async (req, res, next) => {
    try {
      const balance = await enrollmentService.getEnrollmentBalance(
        req.params.id,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(balance, "Lấy công nợ học phí thành công."));
    } catch (error) {
      next(error);
    }
  },

  getDebtReport: async (req, res, next) => {
    try {
      const report = await enrollmentService.getDebtReportByAdmin(req.query);
      res
        .status(200)
        .json(responseSuccess(report, "Lấy báo cáo công nợ thành công."));
    } catch (error) {
      next(error);
    }
  },

  exportDebtReport: async (req, res, next) => {
    try {
      const rows = await enrollmentService.getDebtReportByAdmin(
        {},
        { paginate: false },
      );

      await sendExcelFile(res, {
        fileName: "cong-no-hoc-phi.xlsx",
        sheetName: "Công nợ học phí",
        columns: [
          { header: "Mã ghi danh", key: "enrollment_id", width: 12 },
          { header: "Học viên", key: "student_name", width: 24 },
          { header: "Email", key: "student_email", width: 26 },
          { header: "SĐT", key: "student_phone", width: 14 },
          { header: "Lớp", key: "class_name", width: 20 },
          { header: "Khóa học", key: "course_title", width: 24 },
          { header: "Học phí", key: "tuition_fee", width: 14 },
          { header: "Đã đóng", key: "total_paid", width: 14 },
          { header: "Còn thiếu", key: "balance_due", width: 14 },
        ],
        rows: rows.map((row) => ({
          enrollment_id: row.enrollment_id,
          student_name: row.student.full_name,
          student_email: row.student.email,
          student_phone: row.student.phone,
          class_name: row.class.class_name,
          course_title: row.course.title,
          tuition_fee: row.tuition_fee,
          total_paid: row.total_paid,
          balance_due: row.balance_due,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  sendTuitionReminders: async (req, res, next) => {
    try {
      const result = await enrollmentService.sendTuitionRemindersByAdmin();
      res
        .status(200)
        .json(responseSuccess(result, `Đã gửi ${result.sent}/${result.total} email nhắc học phí.`));
    } catch (error) {
      next(error);
    }
  },

  // Miễn giảm học phí + hoàn tiền
  setDiscount: async (req, res, next) => {
    try {
      const { discount_amount } = req.body;
      const updated = await enrollmentService.setEnrollmentDiscountByAdmin(
        req.params.id,
        discount_amount,
        req.user,
      );
      res.status(200).json(responseSuccess(updated, "Cập nhật miễn giảm học phí thành công."));
    } catch (error) {
      next(error);
    }
  },

  createRefund: async (req, res, next) => {
    try {
      const refund = await enrollmentService.createRefundByAdmin(
        req.params.id,
        req.body,
        req.user,
      );
      res.status(201).json(responseSuccess(refund, "Tạo phiếu hoàn tiền thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getRefunds: async (req, res, next) => {
    try {
      const refunds = await enrollmentService.getRefundsByEnrollment(req.params.id, req.user);
      res.status(200).json(responseSuccess(refunds, "Lấy lịch sử hoàn tiền thành công."));
    } catch (error) {
      next(error);
    }
  },

  applyVoucher: async (req, res, next) => {
    try {
      const { code } = req.body;
      const updated = await enrollmentService.applyVoucherByAdmin(
        req.params.id,
        code,
        req.user,
      );
      res.status(200).json(responseSuccess(updated, "Áp dụng voucher thành công."));
    } catch (error) {
      next(error);
    }
  },
};
