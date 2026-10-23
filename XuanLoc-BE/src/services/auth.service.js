import bcrypt from "bcrypt";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../common/helpers/exception.helper.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../common/helpers/jwt.helper.js";

export const authService = {
  // 1. Đăng nhập (Sinh cả Access Token & Refresh Token)
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new BadRequestError("Vui lòng nhập đầy đủ email và password.");
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        full_name: true,
        email: true,
        password: true,
        role: true,
        status: true,
        avatar_url: true,
      },
    });

    if (!user) {
      throw new BadRequestError("Email hoặc mật khẩu không chính xác.");
    }

    if (user.status === "inactive") {
      throw new UnauthorizedError("Tài khoản của bạn đã bị khóa.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestError("Email hoặc mật khẩu không chính xác.");
    }

    // Sinh Access Token (15m/1h) & Refresh Token (7d)
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user.id });

    // Lưu Refresh Token vào DB
    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    delete user.password;

    return { user, accessToken, refreshToken };
  },

  // 2. Cấp lại Token
  refreshToken: async (tokenFromCookie) => {
    if (!tokenFromCookie) {
      throw new UnauthorizedError("Không tìm thấy Refresh Token.");
    }

    const decoded = verifyRefreshToken(tokenFromCookie);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        refresh_token: true,
      },
    });

    if (!user || user.refresh_token !== tokenFromCookie) {
      throw new UnauthorizedError("Refresh Token không hợp lệ.");
    }

    if (user.status === "inactive") {
      throw new UnauthorizedError("Tài khoản của bạn đã bị khóa.");
    }

    const newAccessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  },

  // 3. Đăng xuất
  logout: async (userId) => {
    await prisma.users.update({
      where: { id: userId },
      data: { refresh_token: null },
    });
    return true;
  },

  // 4. Lấy thông tin người dùng hiện tại từ access token (khôi phục phiên đăng nhập khi FE reload trang)
  getMe: async (userId) => {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        referral_code: true,
      },
    });

    if (!user || user.status === "inactive") {
      throw new UnauthorizedError("Tài khoản không hợp lệ hoặc đã bị khóa.");
    }

    return user;
  },
};
