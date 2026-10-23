import { authService } from "../services/auth.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      // Cấu hình thời gian sống cho cookie (Ví dụ: Access Token 15 phút, Refresh Token 7 ngày)
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 phút
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      res.status(200).json(
        responseSuccess(
          {
            user: result.user,
          },
          "Đăng nhập thành công",
        ),
      );
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const result = await authService.refreshToken(refreshToken);

      // Cấp lại Access Token mới vào Cookie
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res
        .status(200)
        .json(responseSuccess(null, "Cấp lại Access Token thành công"));
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await authService.getMe(req.user.id);
      res.status(200).json(responseSuccess(user, "Lấy thông tin tài khoản thành công"));
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      if (req.user?.id) {
        await authService.logout(req.user.id);
      }
      // Xóa cả 2 cookie khi logout
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(200).json(responseSuccess(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  },
};
