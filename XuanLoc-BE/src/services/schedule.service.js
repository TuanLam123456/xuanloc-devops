import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import { assertValidRoom } from "./room.service.js";
import { sendScheduleChangedEmail } from "../common/helpers/mail.helper.js";

// Prisma trả @db.Time dưới dạng Date với giờ/phút literal nằm ở các getter UTC
// (không phụ thuộc timezone server) -> quy đổi ra số phút trong ngày để so sánh overlap.
const timeToMinutes = (date) => date.getUTCHours() * 60 + date.getUTCMinutes();

// Lọc theo khoảng ngày (FE calendar view theo tuần/tháng) - cả 2 mốc đều optional
const buildSessionDateFilter = (from, to) => {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: new Date(`${from}T00:00:00Z`) }),
    ...(to && { lte: new Date(`${to}T23:59:59Z`) }),
  };
};

// Gửi email báo lịch đổi cho toàn bộ học viên đang active trong lớp
const notifyScheduleChanged = async (classId, { sessionDate, startTime, endTime, room }) => {
  const foundClass = await prisma.classes.findUnique({
    where: { id: classId },
    select: { class_name: true },
  });

  const activeStudents = await prisma.enrollments.findMany({
    where: { class_id: classId, status: "active", deleted_at: null },
    select: { users: { select: { email: true, full_name: true } } },
  });

  await Promise.all(
    activeStudents.map(({ users: student }) =>
      sendScheduleChangedEmail(student.email, {
        studentName: student.full_name,
        className: foundClass?.class_name || "",
        sessionDate,
        startTime,
        endTime,
        room,
      }).catch((err) => console.error("Lỗi gửi email đổi lịch học:", err.message)),
    ),
  );
};

// Kiểm tra trùng lịch: cùng ngày + cùng phòng HOẶC cùng giáo viên + khung giờ chồng lấn.
const assertNoScheduleConflict = async ({
  teacherId,
  room,
  sessionDate,
  startTime,
  endTime,
  excludeScheduleId,
}) => {
  const newStartMin = timeToMinutes(new Date(`${sessionDate}T${startTime}Z`));
  const newEndMin = timeToMinutes(new Date(`${sessionDate}T${endTime}Z`));

  const sameDaySchedules = await prisma.class_schedules.findMany({
    where: {
      session_date: new Date(sessionDate),
      ...(excludeScheduleId && { id: { not: excludeScheduleId } }),
      OR: [
        { room },
        ...(teacherId ? [{ classes: { teacher_id: teacherId } }] : []),
      ],
    },
  });

  const hasConflict = sameDaySchedules.some((schedule) => {
    const existingStart = timeToMinutes(schedule.start_time);
    const existingEnd = timeToMinutes(schedule.end_time);
    return existingStart < newEndMin && existingEnd > newStartMin;
  });

  if (hasConflict) {
    throw new BadRequestError(
      "Khung giờ này đã trùng với một buổi học khác (cùng phòng hoặc cùng giáo viên).",
    );
  }
};

export const scheduleService = {
  // 1. Học viên: Xem thời khóa biểu các lớp mình đang theo học (status = 'active')
  getStudentSchedule: async (studentId, { from, to } = {}) => {
    const sId = Number(studentId);

    if (!sId || isNaN(sId)) {
      throw new BadRequestError("Mã học viên không hợp lệ.");
    }

    return await prisma.class_schedules.findMany({
      where: {
        ...(buildSessionDateFilter(from, to) && {
          session_date: buildSessionDateFilter(from, to),
        }),
        classes: {
          enrollments: {
            some: {
              student_id: sId,
              status: "active",
            },
          },
        },
      },
      include: {
        classes: {
          select: {
            id: true,
            class_name: true,
            room: true,
            courses: { select: { id: true, code: true, title: true } },
            users: { select: { id: true, full_name: true, email: true } }, // Giáo viên phụ trách
          },
        },
      },
      orderBy: [{ session_date: "asc" }, { start_time: "asc" }],
    });
  },

  // 2. Giáo viên: Xem thời khóa biểu giảng dạy của bản thân
  getTeacherSchedule: async (teacherId, { from, to } = {}) => {
    const tId = Number(teacherId);

    if (!tId || isNaN(tId)) {
      throw new BadRequestError("Mã giáo viên không hợp lệ.");
    }

    return await prisma.class_schedules.findMany({
      where: {
        ...(buildSessionDateFilter(from, to) && {
          session_date: buildSessionDateFilter(from, to),
        }),
        classes: {
          teacher_id: tId,
        },
      },
      include: {
        classes: {
          select: {
            id: true,
            class_name: true,
            room: true,
            courses: { select: { id: true, code: true, title: true } },
          },
        },
      },
      orderBy: [{ session_date: "asc" }, { start_time: "asc" }],
    });
  },

  // 3. Tra cứu thời khóa biểu theo Lớp học cụ thể
  getSchedulesByClass: async (classId, { from, to } = {}) => {
    const cId = Number(classId);

    if (!cId || isNaN(cId)) {
      throw new BadRequestError("Mã lớp học không hợp lệ.");
    }

    const foundClass = await prisma.classes.findUnique({
      where: { id: cId },
    });
    if (!foundClass) {
      throw new NotFoundError("Không tìm thấy lớp học.");
    }

    return await prisma.class_schedules.findMany({
      where: {
        class_id: cId,
        ...(buildSessionDateFilter(from, to) && {
          session_date: buildSessionDateFilter(from, to),
        }),
      },
      orderBy: [{ session_date: "asc" }, { start_time: "asc" }],
    });
  },

  // 4. Admin: Tạo mới 1 buổi học trong lịch trình
  createScheduleByAdmin: async (body) => {
    const { class_id, session_date, start_time, end_time, room, note } = body;

    if (!class_id || !session_date || !start_time || !end_time) {
      throw new BadRequestError(
        "Vui lòng nhập đầy đủ: class_id, session_date, start_time, end_time.",
      );
    }

    const cId = Number(class_id);
    if (isNaN(cId)) {
      throw new BadRequestError("class_id phải là chữ số.");
    }

    const foundClass = await prisma.classes.findUnique({
      where: { id: cId },
    });
    if (!foundClass) {
      throw new NotFoundError("Lớp học liên kết không tồn tại.");
    }

    await assertValidRoom(room || foundClass.room);

    await assertNoScheduleConflict({
      teacherId: foundClass.teacher_id,
      room: room || foundClass.room,
      sessionDate: session_date,
      startTime: start_time,
      endTime: end_time,
    });

    return await prisma.class_schedules.create({
      data: {
        class_id: cId,
        session_date: new Date(session_date),
        // Ép parse theo UTC digit-literal (khớp cách Prisma lưu @db.Time không kèm timezone),
        // tránh kết quả phụ thuộc vào timezone của server chạy Node.
        start_time: new Date(`${session_date}T${start_time}Z`),
        end_time: new Date(`${session_date}T${end_time}Z`),
        room: room || foundClass.room,
        note: note || null,
      },
    });
  },

  // 5. Admin: Cập nhật thông tin buổi học
  updateScheduleByAdmin: async (id, body) => {
    const scheduleId = Number(id);

    if (!id || isNaN(scheduleId)) {
      throw new BadRequestError("ID buổi học không hợp lệ.");
    }

    const { session_date, start_time, end_time, room, note } = body;

    const existingSchedule = await prisma.class_schedules.findUnique({
      where: { id: scheduleId },
    });
    if (!existingSchedule) {
      throw new NotFoundError("Không tìm thấy buổi học.");
    }

    const targetDate = session_date
      ? session_date
      : existingSchedule.session_date.toISOString().split("T")[0];

    const toHms = (date) =>
      [date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
        .map((n) => String(n).padStart(2, "0"))
        .join(":");

    const targetStartTime = start_time || toHms(existingSchedule.start_time);
    const targetEndTime = end_time || toHms(existingSchedule.end_time);
    const targetRoom = room || existingSchedule.room;

    await assertValidRoom(targetRoom);

    const foundClass = await prisma.classes.findUnique({
      where: { id: existingSchedule.class_id },
      select: { teacher_id: true },
    });

    await assertNoScheduleConflict({
      teacherId: foundClass?.teacher_id,
      room: targetRoom,
      sessionDate: targetDate,
      startTime: targetStartTime,
      endTime: targetEndTime,
      excludeScheduleId: scheduleId,
    });

    const existingDateStr = existingSchedule.session_date.toISOString().split("T")[0];
    const hasMeaningfulChange =
      targetDate !== existingDateStr ||
      targetStartTime !== toHms(existingSchedule.start_time) ||
      targetEndTime !== toHms(existingSchedule.end_time) ||
      targetRoom !== existingSchedule.room;

    const updatedSchedule = await prisma.class_schedules.update({
      where: { id: scheduleId },
      data: {
        ...(session_date && { session_date: new Date(session_date) }),
        ...(start_time && {
          start_time: new Date(`${targetDate}T${start_time}Z`),
        }),
        ...(end_time && {
          end_time: new Date(`${targetDate}T${end_time}Z`),
        }),
        ...(room && { room }),
        ...(note !== undefined && { note }),
      },
    });

    if (hasMeaningfulChange) {
      notifyScheduleChanged(existingSchedule.class_id, {
        sessionDate: targetDate,
        startTime: targetStartTime,
        endTime: targetEndTime,
        room: targetRoom,
      }).catch((err) => console.error("Lỗi gửi email đổi lịch học:", err.message));
    }

    return updatedSchedule;
  },

  // 6. Admin: Xóa buổi học
  deleteScheduleByAdmin: async (id) => {
    const scheduleId = Number(id);

    if (!id || isNaN(scheduleId)) {
      throw new BadRequestError("ID buổi học không hợp lệ.");
    }

    const existingSchedule = await prisma.class_schedules.findUnique({
      where: { id: scheduleId },
    });
    if (!existingSchedule) {
      throw new NotFoundError("Không tìm thấy buổi học để xóa.");
    }

    await prisma.class_schedules.delete({
      where: { id: scheduleId },
    });

    return true;
  },
};
