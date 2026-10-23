import express from "express";
import { scheduleController } from "../controllers/schedule.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const scheduleRouter = express.Router();

// ==========================================
// 1. STATIC ROUTES (Khai báo TRƯỚC route động)
// ==========================================

// Học viên xem thời khóa biểu cá nhân
scheduleRouter.get(
  "/my-schedule/student",
  protect,
  checkRole("student"),
  scheduleController.getStudentSchedule,
);

// Giáo viên xem lịch dạy cá nhân
scheduleRouter.get(
  "/my-schedule/teacher",
  protect,
  checkRole("teacher"),
  scheduleController.getTeacherSchedule,
);

// Admin tạo buổi học mới
scheduleRouter.post(
  "/",
  protect,
  checkRole("admin"),
  scheduleController.createSchedule,
);

// ==========================================
// 2. DYNAMIC ROUTES (Có chứa tham số URL)
// ==========================================

// Xem lịch học theo ID Lớp
scheduleRouter.get("/class/:classId", scheduleController.getSchedulesByClass);

// Admin sửa buổi học
scheduleRouter.put(
  "/:id",
  protect,
  checkRole("admin"),
  scheduleController.updateSchedule,
);

// Admin xóa buổi học
scheduleRouter.delete(
  "/:id",
  protect,
  checkRole("admin"),
  scheduleController.deleteSchedule,
);

export default scheduleRouter;
