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

export const reviewService = {
  // Học viên: đánh giá 1 lớp mình đã/đang học
  createReview: async (studentId, body) => {
    const { class_id, rating, comment } = body;
    const cId = Number(class_id);
    const numRating = Number(rating);

    if (!cId || isNaN(cId) || isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new BadRequestError("Vui lòng cung cấp class_id hợp lệ và rating (1 - 5).");
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: { student_id_class_id: { student_id: studentId, class_id: cId } },
    });
    if (!enrollment) {
      throw new ForbiddenError("Bạn chỉ có thể đánh giá lớp học mà mình đã tham gia.");
    }

    const existing = await prisma.reviews.findUnique({
      where: { student_id_class_id: { student_id: studentId, class_id: cId } },
    });
    if (existing) {
      throw new BadRequestError("Bạn đã đánh giá lớp học này rồi.");
    }

    return await prisma.reviews.create({
      data: { student_id: studentId, class_id: cId, rating: numRating, comment: comment || null },
    });
  },

  // Public: xem đánh giá của 1 lớp (dùng làm testimonial trên trang public)
  getReviewsByClass: async (classId) => {
    const cId = Number(classId);
    if (!cId || isNaN(cId)) throw new BadRequestError("Mã lớp học không hợp lệ.");

    return await prisma.reviews.findMany({
      where: { class_id: cId },
      include: { users: { select: { id: true, full_name: true, avatar_url: true } } },
      orderBy: { created_at: "desc" },
    });
  },

  // Admin: xem toàn bộ đánh giá để kiểm duyệt
  getAllReviewsByAdmin: async (query) => {
    const { class_id } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = { ...(class_id && { class_id: Number(class_id) }) };

    const [reviews, total] = await Promise.all([
      prisma.reviews.findMany({
        where: whereCondition,
        include: {
          users: { select: { id: true, full_name: true } },
          classes: { select: { id: true, class_name: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.reviews.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(reviews, total, page, pageSize);
  },

  deleteReviewByAdmin: async (id) => {
    const reviewId = Number(id);
    if (!reviewId || isNaN(reviewId)) throw new BadRequestError("ID đánh giá không hợp lệ.");

    const review = await prisma.reviews.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundError("Không tìm thấy đánh giá để xóa.");

    await prisma.reviews.delete({ where: { id: reviewId } });
    return true;
  },
};
