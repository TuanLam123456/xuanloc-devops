import { reviewService } from "../services/review.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const reviewController = {
  createReview: async (req, res, next) => {
    try {
      const review = await reviewService.createReview(req.user.id, req.body);
      res.status(201).json(responseSuccess(review, "Gửi đánh giá thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getReviewsByClass: async (req, res, next) => {
    try {
      const reviews = await reviewService.getReviewsByClass(req.params.classId);
      res.status(200).json(responseSuccess(reviews, "Lấy danh sách đánh giá thành công."));
    } catch (error) {
      next(error);
    }
  },

  getAllReviews: async (req, res, next) => {
    try {
      const reviews = await reviewService.getAllReviewsByAdmin(req.query);
      res.status(200).json(responseSuccess(reviews, "Lấy danh sách đánh giá thành công."));
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res, next) => {
    try {
      await reviewService.deleteReviewByAdmin(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa đánh giá thành công."));
    } catch (error) {
      next(error);
    }
  },
};
