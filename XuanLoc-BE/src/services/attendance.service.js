import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import { assertTeacherOwnsClass } from "../common/helpers/authorize.helper.js";
import { sendConsecutiveAbsenceEmail } from "../common/helpers/mail.helper.js";

const ABSENCE_ALERT_THRESHOLD = 3;

// Kiểm tra học viên có vừa chạm ngưỡng vắng liên tiếp không, gửi email cảnh báo (fire-and-forget)
const checkAndNotifyConsecutiveAbsence = async (classId, studentIds) => {
  if (studentIds.length === 0) return;

  const foundClass = await prisma.classes.findUnique({
    where: { id: classId },
    select: { class_name: true },
  });

  for (const studentId of studentIds) {
    const recentRecords = await prisma.attendance.findMany({
      where: { class_id: classId, student_id: studentId },
      orderBy: { attendance_date: "desc" },
      take: ABSENCE_ALERT_THRESHOLD,
    });

    const hitThreshold =
      recentRecords.length === ABSENCE_ALERT_THRESHOLD &&
      recentRecords.every((r) => r.status === "absent");

    if (!hitThreshold) continue;

    const student = await prisma.users.findUnique({
      where: { id: studentId },
      select: { email: true, full_name: true },
    });
    if (!student) continue;

    sendConsecutiveAbsenceEmail(student.email, {
      studentName: student.full_name,
      className: foundClass?.class_name || "",
      absentStreak: ABSENCE_ALERT_THRESHOLD,
    }).catch((err) => console.error("Lỗi gửi email cảnh báo vắng học:", err.message));
  }
};

export const attendanceService = {
  // 1. Học viên: Xem nhật ký chuyên cần của cá nhân
  getMyAttendance: async (studentId, query) => {
    const sId = Number(studentId);
    const { class_id } = query;

    if (!sId || isNaN(sId)) {
      throw new BadRequestError("Mã học viên không hợp lệ.");
    }

    return await prisma.attendance.findMany({
      where: {
        student_id: sId,
        ...(class_id && { class_id: Number(class_id) }),
      },
      include: {
        classes: {
          select: {
            id: true,
            class_name: true,
            courses: { select: { title: true, code: true } },
          },
        },
      },
      orderBy: { attendance_date: "desc" },
    });
  },

  // 2. Giáo viên/Admin: Lấy danh sách điểm danh của 1 lớp học theo Ngày cụ thể
  getAttendanceByClassAndDate: async (classId, dateStr, requestingUser) => {
    const cId = Number(classId);

    if (!cId || isNaN(cId)) {
      throw new BadRequestError("ID lớp học không hợp lệ.");
    }

    if (!dateStr) {
      throw new BadRequestError("Vui lòng cung cấp ngày điểm danh (attendance_date).");
    }

    await assertTeacherOwnsClass(cId, requestingUser);

    const attendanceDate = new Date(dateStr);

    // Lấy toàn bộ học viên đang theo học ở lớp này
    const enrollments = await prisma.enrollments.findMany({
      where: { class_id: cId, status: "active" },
      include: {
        users: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
      },
    });

    // Lấy dữ liệu điểm danh đã lưu (nếu có)
    const existingAttendance = await prisma.attendance.findMany({
      where: {
        class_id: cId,
        attendance_date: attendanceDate,
      },
    });

    // Ghép dữ liệu điểm danh với danh sách học viên
    const attendanceMap = new Map(
      existingAttendance.map((item) => [item.student_id, item])
    );

    return enrollments.map((e) => {
      const record = attendanceMap.get(e.student_id);
      return {
        student_id: e.users.id,
        full_name: e.users.full_name,
        email: e.users.email,
        phone: e.users.phone,
        attendance_id: record ? record.id : null,
        status: record ? record.status : "present", // Mặc định là 'present'
        note: record ? record.note : null,
      };
    });
  },

  // 3. Giáo viên/Admin: Điểm danh hàng loạt cho cả lớp trong 1 ngày
  saveBatchAttendance: async (body, requestingUser) => {
    const { class_id, attendance_date, attendance_list } = body;

    if (!class_id || !attendance_date || !Array.isArray(attendance_list)) {
      throw new BadRequestError(
        "Vui lòng cung cấp class_id, attendance_date và danh sách điểm danh (attendance_list)."
      );
    }

    const cId = Number(class_id);

    await assertTeacherOwnsClass(cId, requestingUser);

    // Chỉ chấp nhận điểm danh cho học viên đang thực sự ghi danh (active) vào lớp này
    const activeEnrollments = await prisma.enrollments.findMany({
      where: { class_id: cId, status: "active" },
      select: { student_id: true },
    });
    const activeStudentIds = new Set(activeEnrollments.map((e) => e.student_id));
    const validAttendanceList = attendance_list.filter((item) =>
      activeStudentIds.has(Number(item.student_id)),
    );

    const targetDate = new Date(attendance_date);

    // Dùng Transaction để cập nhật/thêm mới điểm danh hàng loạt
    const result = await prisma.$transaction(
      validAttendanceList.map((item) => {
        const studentId = Number(item.student_id);
        const status = item.status || "present";
        const note = item.note || null;

        return prisma.attendance.upsert({
          where: {
            class_id_student_id_attendance_date: {
              class_id: cId,
              student_id: studentId,
              attendance_date: targetDate,
            },
          },
          update: { status, note },
          create: {
            class_id: cId,
            student_id: studentId,
            attendance_date: targetDate,
            status,
            note,
          },
        });
      })
    );

    const newlyAbsentStudentIds = validAttendanceList
      .filter((item) => (item.status || "present") === "absent")
      .map((item) => Number(item.student_id));
    checkAndNotifyConsecutiveAbsence(cId, newlyAbsentStudentIds).catch((err) =>
      console.error("Lỗi kiểm tra vắng liên tiếp:", err.message),
    );

    return result;
  },

  // 4. Admin/Giáo viên: Cập nhật lẻ 1 bản ghi điểm danh
  updateAttendanceRecord: async (id, body, requestingUser) => {
    const attendanceId = Number(id);

    if (!id || isNaN(attendanceId)) {
      throw new BadRequestError("ID bản ghi điểm danh không hợp lệ.");
    }

    const { status, note } = body;

    if (status && !["present", "absent", "late"].includes(status)) {
      throw new BadRequestError("Trạng thái chỉ chấp nhận: 'present', 'absent' hoặc 'late'.");
    }

    const existingRecord = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!existingRecord) {
      throw new NotFoundError("Không tìm thấy dữ liệu điểm danh.");
    }

    await assertTeacherOwnsClass(existingRecord.class_id, requestingUser);

    return await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...(status && { status }),
        ...(note !== undefined && { note }),
      },
    });
  },
};