import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import { sendNewGradeEmail } from "../common/helpers/mail.helper.js";
import { logActivity } from "../common/helpers/audit.helper.js";

export const gradeService = {
  // 1. Học viên: Xem toàn bộ bảng điểm của bản thân
  getMyGrades: async (studentId) => {
    const sId = Number(studentId);

    return await prisma.grades.findMany({
      where: {
        enrollments: {
          student_id: sId,
        },
      },
      include: {
        enrollments: {
          include: {
            classes: {
              select: { id: true, class_name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  // 2. Giáo viên / Admin: Nhập điểm bài thi cho học viên
  addGradeByTeacher: async (body, requestingUser) => {
    const { enrollment_id, title, score, teacher_comment } = body;

    if (!enrollment_id || !title || score === undefined) {
      throw new BadRequestError("Vui lòng nhập enrollment_id, title và score.");
    }

    const eId = Number(enrollment_id);
    const numScore = Number(score);

    if (isNaN(eId) || isNaN(numScore) || numScore < 0 || numScore > 10) {
      throw new BadRequestError("Điểm số (0 - 10) hoặc enrollment_id không hợp lệ.");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      include: {
        classes: { select: { teacher_id: true, class_name: true } },
        users: { select: { email: true, full_name: true } },
      },
    });
    if (!enrollment) throw new NotFoundError("Thông tin ghi danh không tồn tại.");

    if (
      requestingUser?.role === "teacher" &&
      enrollment.classes.teacher_id !== requestingUser.id
    ) {
      throw new ForbiddenError(
        "Bạn không phụ trách lớp học của học viên này nên không thể nhập điểm.",
      );
    }

    const newGrade = await prisma.grades.create({
      data: {
        enrollment_id: eId,
        title,
        score: numScore,
        teacher_comment: teacher_comment || null,
      },
    });

    sendNewGradeEmail(enrollment.users.email, {
      studentName: enrollment.users.full_name,
      className: enrollment.classes.class_name,
      title,
      score: numScore,
    }).catch((err) => console.error("Lỗi gửi email điểm mới:", err.message));

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "grade.create",
      entityType: "grades",
      entityId: newGrade.id,
      meta: { enrollment_id: eId, title, score: numScore },
    });

    return newGrade;
  },

  // 3. Học viên (chủ sở hữu) / Giáo viên / Admin: Lấy danh sách điểm thi của một lượt ghi danh
  getGradesByEnrollment: async (enrollmentId, requestingUser) => {
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
      throw new ForbiddenError("Bạn không có quyền xem điểm của ghi danh này.");
    }

    return await prisma.grades.findMany({
      where: { enrollment_id: eId },
      orderBy: { created_at: "desc" },
    });
  },
};