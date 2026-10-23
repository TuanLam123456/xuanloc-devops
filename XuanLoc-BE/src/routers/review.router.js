import express from "express";
import { reviewController } from "../controllers/review.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", protect, checkRole("student"), reviewController.createReview);
reviewRouter.get("/class/:classId", reviewController.getReviewsByClass);
reviewRouter.get("/", protect, checkRole("admin"), reviewController.getAllReviews);
reviewRouter.delete("/:id", protect, checkRole("admin"), reviewController.deleteReview);

export default reviewRouter;
