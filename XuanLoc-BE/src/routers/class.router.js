import express from "express";
import { classController } from "../controllers/class.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const classRouter = express.Router();

// ==========================================
// 1. STATIC ROUTES (Phải khai báo ĐẦU TIÊN)
// ==========================================

// Public xem danh sách các lớp học tuyển sinh
classRouter.get("/public", classController.getClassesForPublic);

// Giáo viên xem danh sách các lớp mình giảng dạy
classRouter.get(
  "/my-taught-classes",
  protect,
  checkRole("teacher"),
  classController.getMyTaughtClasses
);

// Admin xem danh sách tất cả các lớp học
classRouter.get("/", protect, checkRole("admin"), classController.getAllClasses);

// Admin tạo lớp học mới
classRouter.post("/", protect, checkRole("admin"), classController.createClass);


// ==========================================
// 2. DYNAMIC ROUTES (Chứa tham số :id - Khai báo CUỐI CÙNG)
// ==========================================

// Xem chi tiết 1 lớp học
classRouter.get("/:id", classController.getClassById);

// Admin cập nhật lớp học (Đổi GV, đổi phòng, đổi lịch)
classRouter.put("/:id", protect, checkRole("admin"), classController.updateClass);

// Admin xóa lớp học
classRouter.delete("/:id", protect, checkRole("admin"), classController.deleteClass);

export default classRouter;