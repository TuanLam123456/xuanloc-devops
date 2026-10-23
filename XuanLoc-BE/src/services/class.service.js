import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";
import { assertValidRoom } from "./room.service.js";

export const classService = {
  // 1. Dành cho Khách & Học viên: Xem danh sách lớp học công khai đang tuyển sinh
  getClassesForPublic: async (query) => {
    const { course_id, status } = query;

    const classes = await prisma.classes.findMany({
      where: {
        ...(course_id && { course_id: Number(course_id) }),
        status: status || "upcoming",
      },
      include: {
        courses: {
          select: {
            id: true,
            code: true,
            title: true,
            tuition_fee: true,
            duration_months: true,
          },
        },
        users: {
          select: {
            id: true,
            full_name: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { start_date: "asc" },
    });

    return classes;
  },

  // 2. Giáo viên: Xem danh sách các lớp do chính mình phụ trách giảng dạy
  getMyTaughtClasses: async (teacherId) => {
    const tId = Number(teacherId);

    if (!tId || isNaN(tId)) {
      throw new BadRequestError("Mã giáo viên không hợp lệ.");
    }

    return await prisma.classes.findMany({
      where: { teacher_id: tId },
      include: {
        courses: {
          select: { id: true, code: true, title: true, tuition_fee: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { start_date: "desc" },
    });
  },

  // 3. Admin: Lấy toàn bộ danh sách lớp học để quản lý (Lọc theo course_id, status, teacher_id)
  getAllClassesByAdmin: async (query) => {
    const { course_id, teacher_id, status, keyword } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(course_id && { course_id: Number(course_id) }),
      ...(teacher_id && { teacher_id: Number(teacher_id) }),
      ...(status && { status }),
      ...(keyword && { class_name: { contains: keyword } }),
    };

    const [classes, total] = await Promise.all([
      prisma.classes.findMany({
        where: whereCondition,
        include: {
          courses: {
            select: { id: true, code: true, title: true },
          },
          users: {
            select: { id: true, full_name: true, email: true, phone: true },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.classes.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(classes, total, page, pageSize);
  },

  // 4. Xem chi tiết 1 lớp học theo ID (Đã Validate kiên cố chống lỗi NaN)
  getClassById: async (id) => {
    const classId = Number(id);

    if (!id || isNaN(classId)) {
      throw new BadRequestError("ID lớp học không hợp lệ.");
    }

    const foundClass = await prisma.classes.findUnique({
      where: { id: classId },
      include: {
        courses: true,
        users: {
          select: {
            id: true,
            full_name: true,
            teacher_details: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
        class_lessons: {
          include: {
            lessons: true,
          },
          orderBy: { lessons: { lesson_number: "asc" } },
        },
      },
    });

    if (!foundClass) {
      throw new NotFoundError("Không tìm thấy lớp học.");
    }

    return foundClass;
  },

  // 5. Admin: Tạo lớp học mới (Chọn Khóa học, Phân công Giáo viên, Chọn 1 trong 5 Phòng học và Lịch học)
  createClassByAdmin: async (body) => {
    const {
      course_id,
      teacher_id,
      class_name,
      room,
      schedule_text,
      start_date,
      status,
      max_students,
    } = body;

    if (!course_id || !class_name) {
      throw new BadRequestError("Vui lòng cung cấp course_id và class_name.");
    }

    // Kiểm tra Khóa học tồn tại
    const course = await prisma.courses.findUnique({
      where: { id: Number(course_id) },
    });
    if (!course) {
      throw new NotFoundError("Khóa học liên kết không tồn tại.");
    }

    // Kiểm tra Giáo viên (nếu Admin phân công ngay khi tạo lớp)
    if (teacher_id) {
      const teacher = await prisma.users.findUnique({
        where: { id: Number(teacher_id) },
      });
      if (!teacher || teacher.role !== "teacher") {
        throw new BadRequestError("Giáo viên được phân công không hợp lệ.");
      }
    }

    // Kiểm tra phòng học tồn tại và đang hoạt động
    const selectedRoom = room || "Phòng 1";
    await assertValidRoom(selectedRoom);

    const newClass = await prisma.classes.create({
      data: {
        course_id: Number(course_id),
        teacher_id: teacher_id ? Number(teacher_id) : null,
        class_name,
        room: selectedRoom,
        schedule_text: schedule_text || null,
        start_date: start_date ? new Date(start_date) : null,
        status: status || "upcoming",
        max_students: max_students != null ? Number(max_students) : null,
      },
      include: {
        courses: true,
        users: { select: { id: true, full_name: true, email: true } },
      },
    });

    return newClass;
  },

  // 6. Admin: Cập nhật thông tin lớp học
  updateClassByAdmin: async (id, body) => {
    const classId = Number(id);

    if (!id || isNaN(classId)) {
      throw new BadRequestError("ID lớp học không hợp lệ.");
    }

    const {
      course_id,
      teacher_id,
      class_name,
      room,
      schedule_text,
      start_date,
      status,
      max_students,
    } = body;

    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
    });
    if (!existingClass) {
      throw new NotFoundError("Không tìm thấy lớp học.");
    }

    if (room) {
      await assertValidRoom(room);
    }

    if (teacher_id) {
      const teacher = await prisma.users.findUnique({
        where: { id: Number(teacher_id) },
      });
      if (!teacher || teacher.role !== "teacher") {
        throw new BadRequestError("Giáo viên được phân công không hợp lệ.");
      }
    }

    const updatedClass = await prisma.classes.update({
      where: { id: classId },
      data: {
        ...(course_id && { course_id: Number(course_id) }),
        ...(teacher_id !== undefined && {
          teacher_id: teacher_id ? Number(teacher_id) : null,
        }),
        ...(class_name && { class_name }),
        ...(room && { room }),
        ...(schedule_text !== undefined && { schedule_text }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(status && { status }),
        ...(max_students !== undefined && {
          max_students: max_students != null ? Number(max_students) : null,
        }),
      },
      include: {
        courses: true,
        users: { select: { id: true, full_name: true, email: true } },
      },
    });

    return updatedClass;
  },

  // 7. Admin: Xóa lớp học
  deleteClassByAdmin: async (id) => {
    const classId = Number(id);

    if (!id || isNaN(classId)) {
      throw new BadRequestError("ID lớp học không hợp lệ.");
    }

    const existingClass = await prisma.classes.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      throw new NotFoundError("Không tìm thấy lớp học để xóa.");
    }

    await prisma.classes.delete({
      where: { id: classId },
    });

    return true;
  },
};
