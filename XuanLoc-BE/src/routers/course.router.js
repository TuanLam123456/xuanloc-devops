import express from "express";
import { courseController } from "../controllers/course.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const courseRouter = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (Khách / Học viên xem tự do)
// ==========================================
courseRouter.get("/public", courseController.getCoursesForPublic);
courseRouter.get("/:id", courseController.getCourseById);

// ==========================================
// 2. ADMIN MANAGEMENT ROUTES (Chỉ Admin)
// ==========================================
courseRouter.get("/", protect, checkRole("admin"), courseController.getAllCourses);
courseRouter.post("/", protect, checkRole("admin"), courseController.createCourse);
courseRouter.put("/:id", protect, checkRole("admin"), courseController.updateCourse);
courseRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  courseController.toggleCourseStatus
);
courseRouter.delete(
  "/:id",
  protect,
  checkRole("admin"),
  courseController.deleteCourse
);

export default courseRouter;