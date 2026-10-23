import express from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const attendanceRouter = express.Router();

// ==========================================
// 1. STATIC & SELF-SERVICE ROUTES
// ==========================================

// Học viên xem nhật ký điểm danh của mình
attendanceRouter.get(
  "/my-attendance",
  protect,
  checkRole("student"),
  attendanceController.getMyAttendance
);

// Giáo viên / Admin thực hiện điểm danh cả lớp
attendanceRouter.post(
  "/batch",
  protect,
  checkRole("teacher", "admin"),
  attendanceController.saveBatchAttendance
);

// ==========================================
// 2. DYNAMIC ROUTES
// ==========================================

// Lấy danh sách điểm danh theo Lớp & Ngày (VD: /api/attendance/class/1?date=2026-09-01)
attendanceRouter.get(
  "/class/:classId",
  protect,
  checkRole("teacher", "admin"),
  attendanceController.getAttendanceByClassAndDate
);

// Sửa lẻ 1 bản ghi điểm danh
attendanceRouter.put(
  "/:id",
  protect,
  checkRole("teacher", "admin"),
  attendanceController.updateAttendanceRecord
);

export default attendanceRouter;