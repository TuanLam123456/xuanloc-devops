import { prisma } from "../common/prisma/connect.prisma.js";

export const dashboardService = {
  // Số liệu tổng quan tại thời điểm hiện tại + trong tháng hiện tại
  getOverview: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      totalTeachers,
      activeClasses,
      newLeadsThisMonth,
      revenueAgg,
      attendanceThisMonth,
      presentThisMonth,
      totalEnrollments,
      droppedEnrollments,
    ] = await Promise.all([
      prisma.users.count({ where: { role: "student", status: "active" } }),
      prisma.users.count({ where: { role: "teacher", status: "active" } }),
      prisma.classes.count({ where: { status: { in: ["upcoming", "ongoing"] } } }),
      prisma.course_registrations.count({
        where: { status: "pending", created_at: { gte: startOfMonth } },
      }),
      prisma.payments.aggregate({
        _sum: { amount_paid: true },
        where: { payment_date: { gte: startOfMonth } },
      }),
      prisma.attendance.count({ where: { attendance_date: { gte: startOfMonth } } }),
      prisma.attendance.count({
        where: { attendance_date: { gte: startOfMonth }, status: "present" },
      }),
      prisma.enrollments.count({ where: { deleted_at: null } }),
      prisma.enrollments.count({ where: { deleted_at: null, status: "dropped" } }),
    ]);

    const revenueThisMonth = Number(revenueAgg._sum.amount_paid || 0);
    const attendanceRate =
      attendanceThisMonth > 0 ? (presentThisMonth / attendanceThisMonth) * 100 : null;
    const dropoutRate =
      totalEnrollments > 0 ? (droppedEnrollments / totalEnrollments) * 100 : null;

    return {
      total_students: totalStudents,
      total_teachers: totalTeachers,
      active_classes: activeClasses,
      new_leads_this_month: newLeadsThisMonth,
      revenue_this_month: revenueThisMonth,
      attendance_rate_this_month: attendanceRate,
      dropout_rate: dropoutRate,
    };
  },

  // Doanh thu theo từng tháng trong N tháng gần nhất (mặc định 6 tháng)
  getRevenueTrend: async (months) => {
    const n = Math.max(1, Math.min(24, Number(months) || 6));
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (n - 1), 1);

    const payments = await prisma.payments.findMany({
      where: { payment_date: { gte: start } },
      select: { amount_paid: true, payment_date: true },
    });

    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const buckets = new Map();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
      buckets.set(monthKey(d), 0);
    }

    payments.forEach((p) => {
      const key = monthKey(p.payment_date);
      if (buckets.has(key)) {
        buckets.set(key, buckets.get(key) + Number(p.amount_paid));
      }
    });

    return Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue }));
  },
};
