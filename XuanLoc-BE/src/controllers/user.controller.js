import fs from "fs";
import { userService } from "../services/user.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
import { sendExcelFile } from "../common/helpers/excel.helper.js";

export const userController = {
  // ==========================================
  // 1. CONTROLLER DÀNH CHO ADMIN
  // ==========================================

  createUser: async (req, res, next) => {
    try {
      const newUser = await userService.createUserByAdmin(req.body);
      res
        .status(201)
        .json(responseSuccess(newUser, "Tạo người dùng thành công", 201));
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsersByAdmin(req.query);
      res
        .status(200)
        .json(responseSuccess(users, "Lấy danh sách người dùng thành công"));
    } catch (error) {
      next(error);
    }
  },

  exportUsers: async (req, res, next) => {
    try {
      const users = await userService.exportUsersByAdmin(req.query);

      await sendExcelFile(res, {
        fileName: "danh-sach-nguoi-dung.xlsx",
        sheetName: "Danh sách người dùng",
        columns: [
          { header: "ID", key: "id", width: 8 },
          { header: "Họ tên", key: "full_name", width: 24 },
          { header: "Email", key: "email", width: 26 },
          { header: "SĐT", key: "phone", width: 14 },
          { header: "Vai trò", key: "role", width: 12 },
          { header: "Trạng thái", key: "status", width: 12 },
          { header: "Mã học viên", key: "student_code", width: 16 },
        ],
        rows: users.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          status: u.status,
          student_code: u.student_details?.student_code || "",
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const user = await userService.getUserByIdByAdmin(req.params.id);
      res
        .status(200)
        .json(responseSuccess(user, "Lấy thông tin người dùng thành công"));
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const updatedUser = await userService.updateUserByAdmin(
        req.params.id,
        req.body,
      );
      res
        .status(200)
        .json(responseSuccess(updatedUser, "Cập nhật người dùng thành công"));
    } catch (error) {
      next(error);
    }
  },

  toggleStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const updatedUser = await userService.toggleUserStatusByAdmin(
        req.params.id,
        status,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(updatedUser, "Cập nhật trạng thái thành công"));
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { newPassword } = req.body;
      await userService.resetUserPasswordByAdmin(req.params.id, newPassword, req.user);
      res
        .status(200)
        .json(responseSuccess(null, "Đặt lại mật khẩu thành công"));
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      await userService.deleteUserByAdmin(req.params.id, req.user);
      res.status(200).json(responseSuccess(null, "Xóa người dùng thành công"));
    } catch (error) {
      next(error);
    }
  },

  setTeacherRate: async (req, res, next) => {
    try {
      const { rate_per_session } = req.body;
      const updated = await userService.setTeacherRateByAdmin(
        req.params.id,
        rate_per_session,
      );
      res.status(200).json(responseSuccess(updated, "Cập nhật đơn giá/buổi thành công"));
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 2. CONTROLLER DÀNH CHO HỌC VIÊN & GIÁO VIÊN
  // ==========================================

  getStudentProfile: async (req, res, next) => {
    try {
      const profile = await userService.getStudentProfile(req.user.id);
      res
        .status(200)
        .json(responseSuccess(profile, "Lấy hồ sơ học viên thành công"));
    } catch (error) {
      next(error);
    }
  },

  updateStudentProfile: async (req, res, next) => {
    try {
      const updated = await userService.updateStudentProfile(
        req.user.id,
        req.body,
      );
      res
        .status(200)
        .json(responseSuccess(updated, "Cập nhật hồ sơ học viên thành công"));
    } catch (error) {
      next(error);
    }
  },

  getTeacherProfile: async (req, res, next) => {
    try {
      const profile = await userService.getTeacherProfile(req.user.id);
      res
        .status(200)
        .json(responseSuccess(profile, "Lấy hồ sơ giáo viên thành công"));
    } catch (error) {
      next(error);
    }
  },

  updateTeacherProfile: async (req, res, next) => {
    try {
      const updated = await userService.updateTeacherProfile(
        req.user.id,
        req.body,
      );
      res
        .status(200)
        .json(responseSuccess(updated, "Cập nhật hồ sơ giáo viên thành công"));
    } catch (error) {
      next(error);
    }
  },

  changeMyPassword: async (req, res, next) => {
    try {
      await userService.changeMyPassword(req.user.id, req.body);
      res.status(200).json(responseSuccess(null, "Đổi mật khẩu thành công"));
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // 3. CONTROLLER CẬP NHẬT AVATAR
  // ==========================================

  updateAvatar: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const updatedUser = await userService.updateAvatar(userId, req.file);

      res
        .status(200)
        .json(
          responseSuccess(updatedUser, "Cập nhật ảnh đại diện thành công."),
        );
    } catch (error) {
      // Tự động xóa file vừa upload nếu service ném lỗi
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  },

  // ==========================================
  // 4. CONTROLLER QUÊN MẬT KHẨU
  // ==========================================

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await userService.forgotPassword(email);
      res
        .status(200)
        .json(
          responseSuccess(result, "Yêu cầu đặt lại mật khẩu đã gửi qua email"),
        );
    } catch (error) {
      next(error);
    }
  },

  resetPasswordWithCode: async (req, res, next) => {
    try {
      const { email, codeChangePass, newPassword } = req.body;
      await userService.resetPasswordWithCode({
        email,
        codeChangePass,
        newPassword,
      });
      res
        .status(200)
        .json(responseSuccess(null, "Đặt lại mật khẩu thành công"));
    } catch (error) {
      next(error);
    }
  },
};
