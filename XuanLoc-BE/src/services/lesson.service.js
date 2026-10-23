import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import { assertTeacherOwnsClass } from "../common/helpers/authorize.helper.js";

export const lessonService = {
  // 1. Admin / Giáo viên / Học viên: Xem danh sách bài học theo Khóa học
  getLessonsByCourse: async (courseId) => {
    const cId = Number(courseId);
    if (!cId || isNaN(cId)) throw new BadRequestError("ID khóa học không hợp lệ.");

    return await prisma.lessons.findMany({
      where: { course_id: cId },
      include: {
        lesson_materials: true,
      },
      orderBy: { lesson_number: "asc" },
    });
  },

  // 2. Admin: Tạo bài học mới cho Khóa học
  createLessonByAdmin: async (body) => {
    const { course_id, lesson_number, title, description } = body;

    if (!course_id || !lesson_number || !title) {
      throw new BadRequestError("Vui lòng nhập course_id, lesson_number và title.");
    }

    const cId = Number(course_id);
    const lNum = Number(lesson_number);

    const existingLesson = await prisma.lessons.findUnique({
      where: {
        course_id_lesson_number: {
          course_id: cId,
          lesson_number: lNum,
        },
      },
    });

    if (existingLesson) {
      throw new BadRequestError(`Bài học số ${lNum} đã tồn tại trong khóa học này.`);
    }

    return await prisma.lessons.create({
      data: {
        course_id: cId,
        lesson_number: lNum,
        title,
        description: description || null,
      },
    });
  },

  // 3. Giáo viên / Admin: Xem tiến độ bài học của 1 Lớp
  getClassLessonsProgress: async (classId) => {
    const cId = Number(classId);
    if (!cId || isNaN(cId)) throw new BadRequestError("ID lớp không hợp lệ.");

    return await prisma.class_lessons.findMany({
      where: { class_id: cId },
      include: {
        lessons: true,
      },
      orderBy: { lessons: { lesson_number: "asc" } },
    });
  },

  // 4. Giáo viên: Cập nhật tiến độ dạy & dặn dò bài tập về nhà
  updateClassLessonStatus: async (body, requestingUser) => {
    const { class_id, lesson_id, status, taught_date, homework_assigned } = body;

    if (!class_id || !lesson_id) {
      throw new BadRequestError("Vui lòng truyền class_id và lesson_id.");
    }

    const cId = Number(class_id);
    const lId = Number(lesson_id);

    await assertTeacherOwnsClass(cId, requestingUser);

    return await prisma.class_lessons.upsert({
      where: {
        class_id_lesson_id: {
          class_id: cId,
          lesson_id: lId,
        },
      },
      update: {
        ...(status && { status }),
        ...(taught_date && { taught_date: new Date(taught_date) }),
        ...(homework_assigned !== undefined && { homework_assigned }),
      },
      create: {
        class_id: cId,
        lesson_id: lId,
        status: status || "completed",
        taught_date: taught_date ? new Date(taught_date) : new Date(),
        homework_assigned: homework_assigned || null,
      },
    });
  },

  // 5. Admin / Giáo viên: Đính kèm tài liệu học tập vào 1 bài học (link ngoài, vd Google Drive)
  addLessonMaterial: async (lessonId, body) => {
    const lId = Number(lessonId);
    if (!lId || isNaN(lId)) throw new BadRequestError("ID bài học không hợp lệ.");

    const { file_title, file_url, file_type, file_size } = body;
    if (!file_title || !file_url) {
      throw new BadRequestError("Vui lòng nhập file_title và file_url.");
    }

    const lesson = await prisma.lessons.findUnique({ where: { id: lId } });
    if (!lesson) throw new NotFoundError("Không tìm thấy bài học.");

    return await prisma.lesson_materials.create({
      data: {
        lesson_id: lId,
        file_title,
        file_url,
        file_type: file_type || null,
        file_size: file_size ? Number(file_size) : null,
      },
    });
  },

  // 6. Admin / Giáo viên: Xóa tài liệu học tập
  deleteLessonMaterial: async (id) => {
    const materialId = Number(id);
    if (!materialId || isNaN(materialId)) {
      throw new BadRequestError("ID tài liệu không hợp lệ.");
    }

    const material = await prisma.lesson_materials.findUnique({
      where: { id: materialId },
    });
    if (!material) throw new NotFoundError("Không tìm thấy tài liệu để xóa.");

    await prisma.lesson_materials.delete({ where: { id: materialId } });
    return true;
  },
};