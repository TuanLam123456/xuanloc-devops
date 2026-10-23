import { prisma } from "../common/prisma/connect.prisma.js";
import { BadRequestError } from "../common/helpers/exception.helper.js";

const monthRange = (month, year) => {
  const m = Number(month) || new Date().getMonth() + 1;
  const y = Number(year) || new Date().getFullYear();
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start, end, month: m, year: y };
};

export const payrollService = {
  // Lương 1 giáo viên trong 1 tháng: số buổi dạy đã hoàn thành x đơn giá/buổi
  getTeacherPayroll: async (teacherId, query = {}) => {
    const tId = Number(teacherId);
    if (!tId || isNaN(tId)) throw new BadRequestError("Mã giáo viên không hợp lệ.");

    const { start, end, month, year } = monthRange(query.month, query.year);

    const teacher = await prisma.users.findUnique({
      where: { id: tId },
      select: {
        id: true,
        full_name: true,
        role: true,
        teacher_details: { select: { rate_per_session: true } },
      },
    });
    if (!teacher || teacher.role !== "teacher") {
      throw new BadRequestError("Giáo viên không hợp lệ.");
    }

    const sessionsCompleted = await prisma.class_lessons.count({
      where: {
        status: "completed",
        taught_date: { gte: start, lt: end },
        classes: { teacher_id: tId },
      },
    });

    const ratePerSession = Number(teacher.teacher_details?.rate_per_session || 0);

    return {
      teacher_id: tId,
      teacher_name: teacher.full_name,
      month,
      year,
      sessions_completed: sessionsCompleted,
      rate_per_session: ratePerSession,
      total_pay: sessionsCompleted * ratePerSession,
    };
  },

  // Admin: bảng lương toàn bộ giáo viên đang active trong 1 tháng
  getAllPayrollByAdmin: async (query = {}) => {
    const { month, year } = monthRange(query.month, query.year);

    const teachers = await prisma.users.findMany({
      where: { role: "teacher", status: "active" },
      select: { id: true },
    });

    const rows = await Promise.all(
      teachers.map((t) => payrollService.getTeacherPayroll(t.id, { month, year })),
    );

    return {
      month,
      year,
      rows,
      total_pay: rows.reduce((sum, r) => sum + r.total_pay, 0),
    };
  },
};
