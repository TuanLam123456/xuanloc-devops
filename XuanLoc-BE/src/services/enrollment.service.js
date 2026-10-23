import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";
import { logActivity } from "../common/helpers/audit.helper.js";
import { sendTuitionReminderEmail } from "../common/helpers/mail.helper.js";
import { assertTeacherOwnsClass } from "../common/helpers/authorize.helper.js";
import { waitlistService } from "./waitlist.service.js";
import { buildVietQrUrl } from "../common/helpers/vietqr.helper.js";
import {
  BANK_ACCOUNT_NO,
  BANK_ACCOUNT_NAME,
  BANK_DISPLAY_NAME,
} from "../common/constant/app.constant.js";

// Công thức công nợ: net_paid = tổng đã đóng - tổng đã hoàn; balance_due = (học phí - miễn giảm) - net_paid
const computeBalance = (tuitionFee, discountAmount, totalPaid, totalRefunded) => {
  const netPaid = totalPaid - totalRefunded;
  return (tuitionFee - discountAmount) - netPaid;
};

export const enrollmentService = {
  // 1. Học viên: Xem các lớp mình đã đăng ký và lịch sử đóng học phí
  getMyEnrollments: async (studentId) => {
    const sId = Number(studentId);

    if (!sId || isNaN(sId)) {
      throw new BadRequestError("Mã học viên không hợp lệ.");
    }

    return await prisma.enrollments.findMany({
      where: { student_id: sId, deleted_at: null },
      include: {
        classes: {
          include: {
            courses: {
              select: {
                id: true,
                code: true,
                title: true,
                tuition_fee: true,
              },
            },
            users: {
              select: { full_name: true, phone: true }, // Giáo viên
            },
          },
        },
        payments: {
          orderBy: { payment_date: "desc" },
        },
        refunds: {
          orderBy: { refunded_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  // 2. Học viên: Tự đăng ký vào một lớp học đang mở tuyển sinh
  registerClassByStudent: async (studentId, classId) => {
    const sId = Number(studentId);
    const cId = Number(classId);

    if (!cId || isNaN(cId)) {
      throw new BadRequestError("Mã lớp học không hợp lệ.");
    }

    const foundClass = await prisma.classes.findUnique({
      where: { id: cId },
    });

    if (!foundClass) {
      throw new NotFoundError("Lớp học không tồn tại.");
    }

    if (!["upcoming", "ongoing"].includes(foundClass.status)) {
      throw new BadRequestError(
        "Lớp học này hiện không nhận đăng ký (đã kết thúc hoặc bị hủy).",
      );
    }

    // Kiểm tra học viên đã đăng ký lớp này chưa
    const existingEnrollment = await prisma.enrollments.findUnique({
      where: {
        student_id_class_id: {
          student_id: sId,
          class_id: cId,
        },
      },
    });

    if (existingEnrollment) {
      // Nếu lượt ghi danh cũ đã bị xóa (soft-delete) trước đó -> hồi sinh lại thay vì tạo mới
      // (tránh đụng @@unique([student_id, class_id]) và giữ liên tục lịch sử điểm/điểm danh/thanh toán).
      if (existingEnrollment.deleted_at) {
        return await prisma.enrollments.update({
          where: { id: existingEnrollment.id },
          data: { deleted_at: null, status: "active" },
          include: {
            classes: {
              include: { courses: true },
            },
          },
        });
      }
      throw new BadRequestError("Bạn đã đăng ký lớp học này rồi.");
    }

    // Lớp đã đầy (có giới hạn sĩ số) -> tự động chuyển sang danh sách chờ thay vì báo lỗi
    if (foundClass.max_students != null) {
      const activeCount = await prisma.enrollments.count({
        where: { class_id: cId, status: "active", deleted_at: null },
      });
      if (activeCount >= foundClass.max_students) {
        const waitlistEntry = await waitlistService.joinWaitlist(sId, cId);
        return { waitlisted: true, waitlist: waitlistEntry };
      }
    }

    return await prisma.enrollments.create({
      data: {
        student_id: sId,
        class_id: cId,
        status: "active",
      },
      include: {
        classes: {
          include: { courses: true },
        },
      },
    });
  },

  // 3. Admin: Lấy danh sách tất cả các lượt ghi danh (Lọc theo class_id, student_id, status)
  getAllEnrollmentsByAdmin: async (query) => {
    const { class_id, student_id, status } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      deleted_at: null,
      ...(class_id && { class_id: Number(class_id) }),
      ...(student_id && { student_id: Number(student_id) }),
      ...(status && { status }),
    };

    const [enrollments, total] = await Promise.all([
      prisma.enrollments.findMany({
        where: whereCondition,
        include: {
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              student_details: true,
            },
          },
          classes: {
            include: {
              courses: {
                select: { id: true, code: true, title: true, tuition_fee: true },
              },
            },
          },
          payments: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.enrollments.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(enrollments, total, page, pageSize);
  },

  // 3b. Giáo viên (lớp mình dạy) / Admin: Danh sách học viên đang active của 1 lớp, kèm
  // enrollment_id - dùng để nhập điểm (Nghiệp vụ nhập điểm cần enrollment_id, không chỉ student_id).
  getEnrollmentsByClassForTeacher: async (classId, requestingUser) => {
    const cId = Number(classId);
    if (!cId || isNaN(cId)) throw new BadRequestError("ID lớp học không hợp lệ.");

    await assertTeacherOwnsClass(cId, requestingUser);

    return await prisma.enrollments.findMany({
      where: { class_id: cId, status: "active", deleted_at: null },
      include: {
        users: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: { users: { full_name: "asc" } },
    });
  },

  // 4. Admin: Chủ động thêm học viên vào lớp (Ghi danh thủ công)
  createEnrollmentByAdmin: async (body) => {
    const { student_id, class_id, status } = body;

    if (!student_id || !class_id) {
      throw new BadRequestError("Vui lòng cung cấp student_id và class_id.");
    }

    const sId = Number(student_id);
    const cId = Number(class_id);

    // Kiểm tra học viên
    const student = await prisma.users.findUnique({
      where: { id: sId },
    });
    if (!student || student.role !== "student") {
      throw new BadRequestError("Học viên không hợp lệ.");
    }

    // Kiểm tra lớp học
    const foundClass = await prisma.classes.findUnique({
      where: { id: cId },
    });
    if (!foundClass) {
      throw new NotFoundError("Lớp học không tồn tại.");
    }

    const existingEnrollment = await prisma.enrollments.findUnique({
      where: {
        student_id_class_id: {
          student_id: sId,
          class_id: cId,
        },
      },
    });
    if (existingEnrollment) {
      if (existingEnrollment.deleted_at) {
        return await prisma.enrollments.update({
          where: { id: existingEnrollment.id },
          data: { deleted_at: null, status: status || "active" },
          include: {
            users: { select: { id: true, full_name: true, email: true } },
            classes: { select: { id: true, class_name: true } },
          },
        });
      }
      throw new BadRequestError("Học viên đã có trong danh sách lớp học này.");
    }

    return await prisma.enrollments.create({
      data: {
        student_id: sId,
        class_id: cId,
        status: status || "active",
      },
      include: {
        users: { select: { id: true, full_name: true, email: true } },
        classes: { select: { id: true, class_name: true } },
      },
    });
  },

  // 5. Admin: Đổi trạng thái ghi danh (active / dropped / completed)
  updateEnrollmentStatusByAdmin: async (id, status, requestingUser) => {
    const enrollmentId = Number(id);

    if (!id || isNaN(enrollmentId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }

    if (!["active", "dropped", "completed"].includes(status)) {
      throw new BadRequestError(
        "Trạng thái chỉ chấp nhận: 'active', 'dropped' hoặc 'completed'.",
      );
    }

    const existingEnrollment = await prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });
    if (!existingEnrollment) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const updated = await prisma.enrollments.update({
      where: { id: enrollmentId },
      data: { status },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "enrollment.update_status",
      entityType: "enrollments",
      entityId: enrollmentId,
      meta: { status },
    });

    return updated;
  },

  // 6. Admin: Xóa lượt ghi danh
  deleteEnrollmentByAdmin: async (id, requestingUser) => {
    const enrollmentId = Number(id);

    if (!id || isNaN(enrollmentId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }

    const existingEnrollment = await prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });
    if (!existingEnrollment || existingEnrollment.deleted_at) {
      throw new NotFoundError("Không tìm thấy lượt ghi danh để xóa.");
    }

    // Soft-delete: giữ lại payments/grades lịch sử thay vì xóa cứng + cascade mất dữ liệu tài chính
    await prisma.enrollments.update({
      where: { id: enrollmentId },
      data: { deleted_at: new Date() },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "enrollment.delete",
      entityType: "enrollments",
      entityId: enrollmentId,
    });

    return true;
  },

  // ==========================================
  // XỬ LÝ THANH TOÁN TIỀN MẶT (PAYMENTS)
  // ==========================================

  // 7. Admin: Lập phiếu thu tiền (tiền mặt hoặc xác nhận đã nhận chuyển khoản)
  createCashPaymentByAdmin: async (body, requestingUser) => {
    const { enrollment_id, amount_paid, note, payment_method } = body;

    if (!enrollment_id || !amount_paid) {
      throw new BadRequestError(
        "Vui lòng cung cấp enrollment_id và số tiền đóng (amount_paid).",
      );
    }

    const eId = Number(enrollment_id);
    const amount = Number(amount_paid);
    const method = payment_method === "transfer" ? "transfer" : "cash";

    if (isNaN(eId) || isNaN(amount) || amount <= 0) {
      throw new BadRequestError("Số tiền hoặc ID ghi danh không hợp lệ.");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      include: {
        classes: {
          include: { courses: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError("Thông tin ghi danh không tồn tại.");
    }

    const defaultNote =
      method === "transfer"
        ? "Xác nhận đã nhận chuyển khoản"
        : "Thu tiền mặt trực tiếp tại trung tâm";

    // Tạo phiếu thu tiền (`cash` hoặc `transfer`)
    const newPayment = await prisma.payments.create({
      data: {
        enrollment_id: eId,
        amount_paid: amount,
        payment_method: method,
        payment_date: new Date(),
        note: note || defaultNote,
      },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "payment.create",
      entityType: "payments",
      entityId: newPayment.id,
      meta: { enrollment_id: eId, amount, payment_method: method },
    });

    return newPayment;
  },

  // 7b. Học viên/Admin/Giáo viên: Lấy mã VietQR để chuyển khoản học phí còn thiếu của 1 Enrollment
  getTransferQrByEnrollment: async (enrollmentId, requestingUser) => {
    const eId = Number(enrollmentId);

    if (!eId || isNaN(eId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      include: {
        classes: { include: { courses: { select: { tuition_fee: true } } } },
        payments: { select: { amount_paid: true } },
        refunds: { select: { amount: true } },
        users: { include: { student_details: { select: { student_code: true } } } },
      },
    });

    if (!enrollment) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const isOwner = enrollment.student_id === requestingUser?.id;
    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isOwner && !isStaff) {
      throw new ForbiddenError("Bạn không có quyền chuyển khoản cho ghi danh này.");
    }

    const tuitionFee = Number(enrollment.classes.courses.tuition_fee);
    const discountAmount = Number(enrollment.discount_amount || 0);
    const totalPaid = enrollment.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const totalRefunded = enrollment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const balanceDue = computeBalance(tuitionFee, discountAmount, totalPaid, totalRefunded);

    if (balanceDue <= 0) {
      throw new BadRequestError("Ghi danh này không còn học phí cần chuyển khoản.");
    }

    const studentCode = enrollment.users?.student_details?.student_code;
    const content = `HOCPHI ${studentCode || "GD" + eId}`;
    const qrUrl = buildVietQrUrl({ amount: balanceDue, addInfo: content });

    if (!qrUrl) {
      throw new BadRequestError(
        "Trung tâm chưa cấu hình tài khoản nhận chuyển khoản. Vui lòng liên hệ Admin.",
      );
    }

    return {
      enrollment_id: eId,
      amount: balanceDue,
      content,
      qr_url: qrUrl,
      bank_account_no: BANK_ACCOUNT_NO,
      bank_account_name: BANK_ACCOUNT_NAME,
      bank_display_name: BANK_DISPLAY_NAME,
    };
  },

  // 8. Admin / Học viên: Xem danh sách các lần thu tiền của 1 Enrollment
  getPaymentsByEnrollment: async (enrollmentId, requestingUser) => {
    const eId = Number(enrollmentId);

    if (!eId || isNaN(eId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      select: { student_id: true },
    });

    if (!enrollment) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const isOwner = enrollment.student_id === requestingUser?.id;
    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isOwner && !isStaff) {
      throw new ForbiddenError(
        "Bạn không có quyền xem lịch sử thanh toán của ghi danh này.",
      );
    }

    return await prisma.payments.findMany({
      where: { enrollment_id: eId },
      orderBy: { payment_date: "desc" },
    });
  },

  // ==========================================
  // CÔNG NỢ HỌC PHÍ
  // ==========================================

  // 9. Admin / Học viên (chủ sở hữu): Xem số dư học phí còn thiếu của 1 Enrollment
  getEnrollmentBalance: async (enrollmentId, requestingUser) => {
    const eId = Number(enrollmentId);

    if (!eId || isNaN(eId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      include: {
        classes: { include: { courses: { select: { tuition_fee: true } } } },
        payments: { select: { amount_paid: true } },
        refunds: { select: { amount: true } },
      },
    });

    if (!enrollment) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const isOwner = enrollment.student_id === requestingUser?.id;
    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isOwner && !isStaff) {
      throw new ForbiddenError("Bạn không có quyền xem công nợ của ghi danh này.");
    }

    const tuitionFee = Number(enrollment.classes.courses.tuition_fee);
    const discountAmount = Number(enrollment.discount_amount || 0);
    const totalPaid = enrollment.payments.reduce(
      (sum, p) => sum + Number(p.amount_paid),
      0,
    );
    const totalRefunded = enrollment.refunds.reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      enrollment_id: eId,
      tuition_fee: tuitionFee,
      discount_amount: discountAmount,
      total_paid: totalPaid,
      total_refunded: totalRefunded,
      balance_due: computeBalance(tuitionFee, discountAmount, totalPaid, totalRefunded),
    };
  },

  // 10. Admin: Báo cáo công nợ toàn trung tâm (chỉ những enrollment còn thiếu tiền)
  getDebtReportByAdmin: async (query = {}, { paginate = true } = {}) => {
    const { page, pageSize } = getPagination(query);

    const enrollments = await prisma.enrollments.findMany({
      where: { deleted_at: null },
      include: {
        users: { select: { id: true, full_name: true, email: true, phone: true } },
        classes: {
          select: {
            id: true,
            class_name: true,
            courses: { select: { id: true, code: true, title: true, tuition_fee: true } },
          },
        },
        payments: { select: { amount_paid: true } },
        refunds: { select: { amount: true } },
      },
    });

    const debtList = enrollments
      .map((e) => {
        const tuitionFee = Number(e.classes.courses.tuition_fee);
        const discountAmount = Number(e.discount_amount || 0);
        const totalPaid = e.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        const totalRefunded = e.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
        return {
          enrollment_id: e.id,
          student: e.users,
          class: { id: e.classes.id, class_name: e.classes.class_name },
          course: e.classes.courses,
          tuition_fee: tuitionFee,
          discount_amount: discountAmount,
          total_paid: totalPaid,
          total_refunded: totalRefunded,
          balance_due: computeBalance(tuitionFee, discountAmount, totalPaid, totalRefunded),
        };
      })
      .filter((row) => row.balance_due > 0)
      .sort((a, b) => b.balance_due - a.balance_due);

    if (!paginate) {
      return debtList;
    }

    const total = debtList.length;
    const start = (page - 1) * pageSize;
    const pageItems = debtList.slice(start, start + pageSize);

    return buildPaginatedResult(pageItems, total, page, pageSize);
  },

  // 11. Admin: bấm gửi email nhắc học phí hàng loạt cho toàn bộ enrollment còn nợ
  sendTuitionRemindersByAdmin: async () => {
    const debtList = await enrollmentService.getDebtReportByAdmin({}, { paginate: false });

    const results = await Promise.allSettled(
      debtList.map((row) =>
        sendTuitionReminderEmail(row.student.email, {
          studentName: row.student.full_name,
          className: row.class.class_name,
          balanceDue: row.balance_due,
        }),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return { total: debtList.length, sent, failed: debtList.length - sent };
  },

  // ==========================================
  // MIỄN GIẢM HỌC PHÍ + HOÀN TIỀN
  // ==========================================

  // 12. Admin: đặt số tiền miễn giảm cho 1 enrollment
  setEnrollmentDiscountByAdmin: async (id, discountAmount, requestingUser) => {
    const enrollmentId = Number(id);
    const amount = Number(discountAmount);

    if (!enrollmentId || isNaN(enrollmentId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }
    if (isNaN(amount) || amount < 0) {
      throw new BadRequestError("Số tiền miễn giảm không hợp lệ.");
    }

    const existingEnrollment = await prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });
    if (!existingEnrollment || existingEnrollment.deleted_at) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const updated = await prisma.enrollments.update({
      where: { id: enrollmentId },
      data: { discount_amount: amount },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "enrollment.set_discount",
      entityType: "enrollments",
      entityId: enrollmentId,
      meta: { discount_amount: amount },
    });

    return updated;
  },

  // 13. Admin: tạo phiếu hoàn học phí
  createRefundByAdmin: async (enrollmentId, body, requestingUser) => {
    const eId = Number(enrollmentId);
    const { amount, reason } = body;
    const numAmount = Number(amount);

    if (!eId || isNaN(eId)) {
      throw new BadRequestError("ID ghi danh không hợp lệ.");
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new BadRequestError("Số tiền hoàn không hợp lệ.");
    }

    const existingEnrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
    });
    if (!existingEnrollment || existingEnrollment.deleted_at) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }

    const refund = await prisma.refunds.create({
      data: { enrollment_id: eId, amount: numAmount, reason: reason || null },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "refund.create",
      entityType: "refunds",
      entityId: refund.id,
      meta: { enrollment_id: eId, amount: numAmount },
    });

    return refund;
  },

  // 14. Admin / Học viên (chủ sở hữu): xem lịch sử hoàn tiền của 1 enrollment
  getRefundsByEnrollment: async (enrollmentId, requestingUser) => {
    const eId = Number(enrollmentId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID ghi danh không hợp lệ.");

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      select: { student_id: true },
    });
    if (!enrollment) throw new NotFoundError("Không tìm thấy thông tin ghi danh.");

    const isOwner = enrollment.student_id === requestingUser?.id;
    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isOwner && !isStaff) {
      throw new ForbiddenError("Bạn không có quyền xem lịch sử hoàn tiền của ghi danh này.");
    }

    return await prisma.refunds.findMany({
      where: { enrollment_id: eId },
      orderBy: { refunded_at: "desc" },
    });
  },

  // 15. Admin: áp mã voucher vào 1 enrollment (cộng dồn vào discount_amount)
  applyVoucherByAdmin: async (enrollmentId, code, requestingUser) => {
    const eId = Number(enrollmentId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID ghi danh không hợp lệ.");
    if (!code) throw new BadRequestError("Vui lòng cung cấp mã voucher.");

    return await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollments.findUnique({
        where: { id: eId },
        include: { classes: { include: { courses: { select: { tuition_fee: true } } } } },
      });
      if (!enrollment || enrollment.deleted_at) {
        throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
      }
      if (enrollment.voucher_id) {
        throw new BadRequestError("Ghi danh này đã áp dụng 1 voucher rồi.");
      }

      const voucher = await tx.vouchers.findUnique({ where: { code } });
      if (!voucher || !voucher.is_active) {
        throw new BadRequestError("Voucher không tồn tại hoặc đã ngừng sử dụng.");
      }

      const now = new Date();
      if (voucher.valid_from && now < voucher.valid_from) {
        throw new BadRequestError("Voucher chưa đến ngày áp dụng.");
      }
      if (voucher.valid_to && now > voucher.valid_to) {
        throw new BadRequestError("Voucher đã hết hạn.");
      }
      if (voucher.max_uses != null && voucher.used_count >= voucher.max_uses) {
        throw new BadRequestError("Voucher đã hết lượt sử dụng.");
      }

      const tuitionFee = Number(enrollment.classes.courses.tuition_fee);
      const discountFromVoucher =
        voucher.discount_type === "percent"
          ? (tuitionFee * Number(voucher.discount_value)) / 100
          : Number(voucher.discount_value);

      const newDiscountAmount = Number(enrollment.discount_amount || 0) + discountFromVoucher;

      const updated = await tx.enrollments.update({
        where: { id: eId },
        data: { discount_amount: newDiscountAmount, voucher_id: voucher.id },
      });

      await tx.vouchers.update({
        where: { id: voucher.id },
        data: { used_count: { increment: 1 } },
      });

      logActivity({
        userId: requestingUser?.id,
        role: requestingUser?.role,
        action: "enrollment.apply_voucher",
        entityType: "enrollments",
        entityId: eId,
        meta: { voucher_code: code, discount_from_voucher: discountFromVoucher },
      });

      return updated;
    });
  },
};
