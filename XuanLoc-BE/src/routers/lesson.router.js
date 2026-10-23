import express from "express";
import { lessonController } from "../controllers/lesson.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const lessonRouter = express.Router();

lessonRouter.get("/course/:courseId", lessonController.getLessonsByCourse);
lessonRouter.get("/class-progress/:classId", protect, lessonController.getClassLessonsProgress);

lessonRouter.post("/", protect, checkRole("admin"), lessonController.createLesson);
lessonRouter.post("/update-progress", protect, checkRole("teacher", "admin"), lessonController.updateClassLessonStatus);

// Tài liệu học tập (link ngoài - Google Drive, YouTube...)
lessonRouter.post(
  "/:lessonId/materials",
  protect,
  checkRole("teacher", "admin"),
  lessonController.addLessonMaterial,
);
lessonRouter.delete(
  "/materials/:id",
  protect,
  checkRole("teacher", "admin"),
  lessonController.deleteLessonMaterial,
);

export default lessonRouter;