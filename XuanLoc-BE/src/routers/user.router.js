import express from "express";
import { userController } from "../controllers/user.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";
import { uploadAvatar } from "../common/middlewares/upload.middleware.js";
import { strictAuthLimiter } from "../common/middlewares/rate-limit.middleware.js";

const userRouter = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (QUÊN MẬT KHẨU)
// ==========================================
userRouter.post(
  "/forgot-password",
  strictAuthLimiter,
  userController.forgotPassword,
);
userRouter.post(
  "/reset-password-code",
  strictAuthLimiter,
  userController.resetPasswordWithCode,
);

// ==========================================
// 2. ADMIN MANAGEMENT ROUTES (CHỈ ADMIN)
// ==========================================
userRouter.post("/", protect, checkRole("admin"), userController.createUser);
userRouter.get("/", protect, checkRole("admin"), userController.getAllUsers);
userRouter.get("/export", protect, checkRole("admin"), userController.exportUsers);
userRouter.get("/:id", protect, checkRole("admin"), userController.getUserById);
userRouter.put("/:id", protect, checkRole("admin"), userController.updateUser);
userRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  userController.toggleStatus,
);
userRouter.patch(
  "/:id/reset-password",
  protect,
  checkRole("admin"),
  userController.resetPassword,
);
userRouter.patch(
  "/:id/rate",
  protect,
  checkRole("admin"),
  userController.setTeacherRate,
);
userRouter.delete(
  "/:id",
  protect,
  checkRole("admin"),
  userController.deleteUser,
);

// ==========================================
// 3. STUDENT & TEACHER SELF-SERVICE ROUTES
// ==========================================
userRouter.get(
  "/profile/student",
  protect,
  checkRole("student"),
  userController.getStudentProfile,
);
userRouter.put(
  "/profile/student",
  protect,
  checkRole("student"),
  userController.updateStudentProfile,
);

userRouter.get(
  "/profile/teacher",
  protect,
  checkRole("teacher"),
  userController.getTeacherProfile,
);
userRouter.put(
  "/profile/teacher",
  protect,
  checkRole("teacher"),
  userController.updateTeacherProfile,
);

userRouter.patch("/change-password", protect, userController.changeMyPassword);

// Route cập nhật avatar
userRouter.patch("/avatar", protect, uploadAvatar, userController.updateAvatar);

export default userRouter;
