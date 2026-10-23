import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";

export const waitlistService = {
  // Học viên tự nguyện tham gia danh sách chờ của 1 lớp (kể cả khi lớp chưa đầy)
  joinWaitlist: async (studentId, classId) => {
    const sId = Number(studentId);
    const cId = Number(classId);

    if (!cId || isNaN(cId)) {
      throw new BadRequestError("Mã lớp học không hợp lệ.");
    }

    const foundClass = await prisma.classes.findUnique({ where: { id: cId } });
    if (!foundClass) throw new NotFoundError("Lớp học không tồn tại.");

    const existing = await prisma.waitlist.findUnique({
      where: { student_id_class_id: { student_id: sId, class_id: cId } },
    });
    if (existing) {
      throw new BadRequestError("Bạn đã có trong danh sách chờ của lớp này.");
    }

    return await prisma.waitlist.create({
      data: { student_id: sId, class_id: cId },
      include: { classes: { select: { id: true, class_name: true } } },
    });
  },

  // Admin: xem danh sách chờ của 1 lớp
  getWaitlistByClass: async (classId) => {
    const cId = Number(classId);
    if (!cId || isNaN(cId)) throw new BadRequestError("Mã lớp học không hợp lệ.");

    return await prisma.waitlist.findMany({
      where: { class_id: cId },
      include: { users: { select: { id: true, full_name: true, email: true, phone: true } } },
      orderBy: { created_at: "asc" },
    });
  },

  // Admin: chuyển 1 người trong danh sách chờ thành ghi danh chính thức
  promoteFromWaitlist: async (waitlistId) => {
    const wId = Number(waitlistId);
    if (!wId || isNaN(wId)) throw new BadRequestError("ID danh sách chờ không hợp lệ.");

    const entry = await prisma.waitlist.findUnique({ where: { id: wId } });
    if (!entry) throw new NotFoundError("Không tìm thấy mục trong danh sách chờ.");

    // Tạo enrollment (hồi sinh nếu trước đó đã từng bị soft-delete, tránh đụng @@unique)
    const existingEnrollment = await prisma.enrollments.findUnique({
      where: {
        student_id_class_id: { student_id: entry.student_id, class_id: entry.class_id },
      },
    });

    let enrollment;
    if (existingEnrollment) {
      if (!existingEnrollment.deleted_at) {
        throw new BadRequestError("Học viên này đã có trong lớp rồi.");
      }
      enrollment = await prisma.enrollments.update({
        where: { id: existingEnrollment.id },
        data: { deleted_at: null, status: "active" },
      });
    } else {
      enrollment = await prisma.enrollments.create({
        data: { student_id: entry.student_id, class_id: entry.class_id, status: "active" },
      });
    }

    await prisma.waitlist.delete({ where: { id: wId } });

    return enrollment;
  },

  removeFromWaitlist: async (id) => {
    const wId = Number(id);
    if (!wId || isNaN(wId)) throw new BadRequestError("ID danh sách chờ không hợp lệ.");

    const entry = await prisma.waitlist.findUnique({ where: { id: wId } });
    if (!entry) throw new NotFoundError("Không tìm thấy mục trong danh sách chờ.");

    await prisma.waitlist.delete({ where: { id: wId } });
    return true;
  },
};
