import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";

export const courseService = {
  // 1. Dành cho Khách/Public: Xem danh sách các khóa học đang mở (is_active = true)
  getCoursesForPublic: async () => {
    return await prisma.courses.findMany({
      where: { is_active: true },
      select: {
        id: true,
        code: true,
        title: true,
        tuition_fee: true,
        duration_months: true,
        description: true,
      },
      orderBy: { created_at: "desc" },
    });
  },

  // 2. Public / Student / Admin xem chi tiết 1 khóa học
  getCourseById: async (id) => {
    const courseId = Number(id);
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { lesson_number: "asc" },
        },
        classes: {
          include: {
            users: {
              select: { id: true, full_name: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Không tìm thấy khóa học.");
    }

    return course;
  },

  // 3. Admin: Lấy danh sách tất cả khóa học (Bao gồm khóa đang ẩn)
  getAllCoursesByAdmin: async (query) => {
    const { keyword, is_active } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(is_active !== undefined && { is_active: is_active === "true" }),
      ...(keyword && {
        OR: [{ code: { contains: keyword } }, { title: { contains: keyword } }],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.courses.findMany({
        where: whereCondition,
        include: {
          _count: {
            select: { classes: true, lessons: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.courses.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(courses, total, page, pageSize);
  },

  // 4. Admin: Tạo khóa học mới
  createCourseByAdmin: async (body) => {
    const {
      code,
      title,
      tuition_fee,
      duration_months,
      description,
      is_active,
    } = body;

    if (!code || !title) {
      throw new BadRequestError(
        "Vui lòng nhập đầy đủ mã (code) và tên khóa học (title).",
      );
    }

    const existingCourse = await prisma.courses.findUnique({
      where: { code },
    });
    if (existingCourse) {
      throw new BadRequestError("Mã khóa học này đã tồn tại.");
    }

    const newCourse = await prisma.courses.create({
      data: {
        code,
        title,
        tuition_fee: tuition_fee ? Number(tuition_fee) : 0.0,
        duration_months: duration_months ? Number(duration_months) : 3,
        description: description || null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
      },
    });

    return newCourse;
  },

  // 5. Admin: Cập nhật khóa học
  updateCourseByAdmin: async (id, body) => {
    const courseId = Number(id);
    const {
      code,
      title,
      tuition_fee,
      duration_months,
      description,
      is_active,
    } = body;

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError("Không tìm thấy khóa học.");
    }

    if (code && code !== course.code) {
      const existingCode = await prisma.courses.findUnique({
        where: { code },
      });
      if (existingCode) {
        throw new BadRequestError("Mã khóa học mới đã bị trùng.");
      }
    }

    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: {
        ...(code && { code }),
        ...(title && { title }),
        ...(tuition_fee !== undefined && { tuition_fee: Number(tuition_fee) }),
        ...(duration_months !== undefined && {
          duration_months: Number(duration_months),
        }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return updatedCourse;
  },

  // 6. Admin: Bật/Tắt trạng thái hoạt động
  toggleCourseStatusByAdmin: async (id, is_active) => {
    const courseId = Number(id);

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError("Không tìm thấy khóa học.");
    }

    return await prisma.courses.update({
      where: { id: courseId },
      data: { is_active: Boolean(is_active) },
    });
  },

  // 7. Admin: Xóa khóa học
  deleteCourseByAdmin: async (id) => {
    const courseId = Number(id);

    const course = await prisma.courses.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError("Không tìm thấy khóa học để xóa.");
    }

    await prisma.courses.delete({
      where: { id: courseId },
    });

    return true;
  },
};
