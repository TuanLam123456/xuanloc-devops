import bcrypt from "bcrypt";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import { sendResetPasswordEmail } from "../common/helpers/mail.helper.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileTypeFromFile } from "file-type";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";
import { logActivity } from "../common/helpers/audit.helper.js";

const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "avatars");
const AVATAR_URL_PATTERN = /^\/uploads\/avatars\/[A-Za-z0-9_.-]+$/;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 phút
const OTP_MAX_ATTEMPTS = 5;

// Chỉ chấp nhận avatar_url trỏ vào chính thư mục uploads/avatars do server quản lý,
// tránh việc client tự truyền path tuỳ ý (path traversal khi xoá file cũ).
const assertSafeAvatarUrl = (avatarUrl) => {
  if (!AVATAR_URL_PATTERN.test(avatarUrl)) {
    throw new BadRequestError("Đường dẫn ảnh đại diện không hợp lệ.");
  }
};

export const userService = {
  // ==========================================
  // 1. TÁC VỤ DÀNH CHO ADMIN
  // ==========================================

  createUserByAdmin: async (body) => {
    const { full_name, email, password, phone, role } = body;

    if (!full_name || !email || !password || !role) {
      throw new BadRequestError(
        "Vui lòng nhập đầy đủ: full_name, email, password, role.",
      );
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError("Email này đã tồn tại trên hệ thống.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          full_name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role,
          referral_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
        },
      });

      if (role === "student") {
        const studentCode = `XL-${new Date().getFullYear()}-${String(user.id).padStart(4, "0")}`;
        await tx.student_details.create({
          data: {
            user_id: user.id,
            student_code: studentCode,
            dob: null,
            parent_name: null,
            parent_phone: null,
          },
        });
      }

      if (role === "teacher") {
        await tx.teacher_details.create({
          data: {
            user_id: user.id,
            specialization: null,
            degree: null,
            bio: null,
          },
        });
      }

      return user;
    });

    return newUser;
  },

  getAllUsersByAdmin: async (query) => {
    const { role, keyword } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(role && { role }),
      ...(keyword && {
        OR: [
          { full_name: { contains: keyword } },
          { email: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: whereCondition,
        include: {
          student_details: true,
          teacher_details: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.users.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(users, total, page, pageSize);
  },

  // Xuất Excel: lấy toàn bộ user khớp filter (role, keyword), không phân trang
  exportUsersByAdmin: async (query) => {
    const { role, keyword } = query;

    return await prisma.users.findMany({
      where: {
        ...(role && { role }),
        ...(keyword && {
          OR: [
            { full_name: { contains: keyword } },
            { email: { contains: keyword } },
            { phone: { contains: keyword } },
          ],
        }),
      },
      include: {
        student_details: true,
        teacher_details: true,
      },
      orderBy: { created_at: "desc" },
    });
  },

  getUserByIdByAdmin: async (id) => {
    const userId = Number(id);
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_details: true,
        teacher_details: true,
        enrollments: {
          include: {
            classes: true,
          },
        },
        classes: true,
      },
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    return user;
  },

  // Admin: đặt đơn giá lương/buổi dạy cho giáo viên (dùng để tính payroll)
  setTeacherRateByAdmin: async (id, ratePerSession) => {
    const userId = Number(id);
    const rate = Number(ratePerSession);

    if (isNaN(rate) || rate < 0) {
      throw new BadRequestError("Đơn giá/buổi không hợp lệ.");
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user || user.role !== "teacher") {
      throw new NotFoundError("Không tìm thấy giáo viên.");
    }

    return await prisma.teacher_details.update({
      where: { user_id: userId },
      data: { rate_per_session: rate },
    });
  },

  updateUserByAdmin: async (id, body) => {
    const userId = Number(id);
    const { full_name, email, phone, role, status } = body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(full_name && { full_name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    return updatedUser;
  },

  toggleUserStatusByAdmin: async (id, status, requestingUser) => {
    const userId = Number(id);

    if (!["active", "inactive"].includes(status)) {
      throw new BadRequestError(
        "Trạng thái chỉ chấp nhận 'active' hoặc 'inactive'.",
      );
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: { status },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "user.toggle_status",
      entityType: "users",
      entityId: userId,
      meta: { status },
    });

    return updated;
  },

  resetUserPasswordByAdmin: async (id, newPassword, requestingUser) => {
    const userId = Number(id);

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError("Mật khẩu mới phải từ 6 ký tự trở lên.");
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refresh_token: null,
      },
    });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "user.reset_password",
      entityType: "users",
      entityId: userId,
    });

    return true;
  },

  deleteUserByAdmin: async (id, requestingUser) => {
    const userId = Number(id);
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng để xóa.");
    }

    await prisma.users.delete({ where: { id: userId } });

    logActivity({
      userId: requestingUser?.id,
      role: requestingUser?.role,
      action: "user.delete",
      entityType: "users",
      entityId: userId,
      meta: { deletedEmail: user.email },
    });

    return true;
  },

  // ==========================================
  // 2. TÁC VỤ DÀNH CHO HỌC VIÊN & GIÁO VIÊN
  // ==========================================

  getStudentProfile: async (userId) => {
    const uId = Number(userId);
    const profile = await prisma.users.findUnique({
      where: { id: uId },
      include: {
        student_details: true,
        enrollments: {
          include: {
            classes: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Không tìm thấy hồ sơ học viên.");
    }

    return profile;
  },

  updateStudentProfile: async (userId, body) => {
    const uId = Number(userId);
    const { full_name, phone, avatar_url, dob, parent_name, parent_phone } =
      body;

    const user = await prisma.users.findUnique({ where: { id: uId } });
    if (!user || user.role !== "student") {
      throw new NotFoundError("Không tìm thấy học viên.");
    }

    if (avatar_url) {
      assertSafeAvatarUrl(avatar_url);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: uId },
        data: {
          ...(full_name && { full_name }),
          ...(phone && { phone }),
          ...(avatar_url && { avatar_url }),
        },
      });

      return await tx.student_details.update({
        where: { user_id: uId },
        data: {
          ...(dob && { dob: new Date(dob) }),
          ...(parent_name && { parent_name }),
          ...(parent_phone && { parent_phone }),
        },
      });
    });
  },

  getTeacherProfile: async (userId) => {
    const uId = Number(userId);
    const profile = await prisma.users.findUnique({
      where: { id: uId },
      include: {
        teacher_details: true,
        classes: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Không tìm thấy hồ sơ giáo viên.");
    }

    return profile;
  },

  updateTeacherProfile: async (userId, body) => {
    const uId = Number(userId);
    const { full_name, phone, avatar_url, specialization, degree, bio } = body;

    const user = await prisma.users.findUnique({ where: { id: uId } });
    if (!user || user.role !== "teacher") {
      throw new NotFoundError("Không tìm thấy giáo viên.");
    }

    if (avatar_url) {
      assertSafeAvatarUrl(avatar_url);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: uId },
        data: {
          ...(full_name && { full_name }),
          ...(phone && { phone }),
          ...(avatar_url && { avatar_url }),
        },
      });

      return await tx.teacher_details.update({
        where: { user_id: uId },
        data: {
          ...(specialization && { specialization }),
          ...(degree && { degree }),
          ...(bio && { bio }),
        },
      });
    });
  },

  changeMyPassword: async (userId, { oldPassword, newPassword }) => {
    const uId = Number(userId);

    if (!oldPassword || !newPassword) {
      throw new BadRequestError("Vui lòng nhập mật khẩu cũ và mật khẩu mới.");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Mật khẩu mới phải từ 6 ký tự trở lên.");
    }

    const user = await prisma.users.findUnique({
      where: { id: uId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundError("Không tìm thấy tài khoản.");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Mật khẩu cũ không chính xác.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: uId },
      data: { password: hashedPassword },
    });

    return true;
  },

  // ==========================================
  // 3. QUY TRÌNH QUÊN MẬT KHỦA (GỬI MAIL OTP)
  // ==========================================

  forgotPassword: async (email) => {
    if (!email) {
      throw new BadRequestError("Vui lòng nhập email.");
    }

    const genericResult = {
      message:
        "Nếu email tồn tại trên hệ thống, mã xác nhận đã được gửi đến địa chỉ email của bạn.",
    };

    const user = await prisma.users.findUnique({ where: { email } });
    // Không tiết lộ email có tồn tại hay không (tránh user enumeration) -
    // luôn trả về cùng 1 message, chỉ thực sự gửi mail khi tìm thấy user.
    if (!user) {
      return genericResult;
    }

    const codeChangePass = String(Math.floor(100000 + Math.random() * 900000));

    await prisma.users.update({
      where: { id: user.id },
      data: {
        codeChangePass,
        codeChangePass_expires_at: new Date(Date.now() + OTP_TTL_MS),
        codeChangePass_attempts: 0,
      },
    });

    await sendResetPasswordEmail(user.email, codeChangePass);

    return genericResult;
  },

  resetPasswordWithCode: async ({ email, codeChangePass, newPassword }) => {
    if (!email || !codeChangePass || !newPassword) {
      throw new BadRequestError(
        "Vui lòng nhập đầy đủ: email, mã xác nhận và mật khẩu mới.",
      );
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        codeChangePass: true,
        codeChangePass_expires_at: true,
        codeChangePass_attempts: true,
      },
    });

    const invalidCodeError = new BadRequestError(
      "Mã xác nhận không chính xác hoặc đã hết hạn.",
    );

    if (!user || !user.codeChangePass) {
      throw invalidCodeError;
    }

    if (
      !user.codeChangePass_expires_at ||
      user.codeChangePass_expires_at.getTime() < Date.now()
    ) {
      throw invalidCodeError;
    }

    if ((user.codeChangePass_attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestError(
        "Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã xác nhận mới.",
      );
    }

    if (user.codeChangePass !== String(codeChangePass)) {
      await prisma.users.update({
        where: { id: user.id },
        data: { codeChangePass_attempts: { increment: 1 } },
      });
      throw invalidCodeError;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        codeChangePass: null,
        codeChangePass_expires_at: null,
        codeChangePass_attempts: 0,
        refresh_token: null,
      },
    });

    return true;
  },

  // ==========================================
  // 4. CẬP NHẬT AVATAR (CÓ TẢI HÌNH & XÓA HÌNH CŨ)
  // ==========================================

  updateAvatar: async (userId, file) => {
    if (!file) {
      throw new BadRequestError("Vui lòng tải lên file hình ảnh.");
    }

    const uId = Number(userId);
    const user = await prisma.users.findUnique({ where: { id: uId } });

    // 1. Kiểm tra user tồn tại -> Nếu không, xóa file vừa upload
    if (!user) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new NotFoundError("Không tìm thấy người dùng.");
    }

    // 1b. Xác thực magic bytes thực tế của file (không tin phần đuôi/mimetype client gửi lên)
    const detectedType = await fileTypeFromFile(file.path);
    if (!detectedType || !ALLOWED_AVATAR_MIME_TYPES.includes(detectedType.mime)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestError(
        "File tải lên không phải là ảnh hợp lệ (jpg, jpeg, png, webp).",
      );
    }

    // 2. Đường dẫn lưu DB
    const relativePath = `/uploads/avatars/${file.filename}`;

    // 3. Xóa avatar cũ của user nếu có (chỉ khi path thực sự nằm trong thư mục uploads/avatars)
    if (user.avatar_url) {
      // Loại bỏ domain thừa nếu avatar_url chứa full URL
      const cleanUrl = user.avatar_url.replace(/^https?:\/\/[^\/]+/, "");

      if (AVATAR_URL_PATTERN.test(cleanUrl)) {
        const resolvedOldPath = path.resolve(process.cwd(), "." + cleanUrl);

        if (
          resolvedOldPath.startsWith(UPLOAD_DIR) &&
          fs.existsSync(resolvedOldPath)
        ) {
          try {
            fs.unlinkSync(resolvedOldPath);
          } catch (err) {
            console.error("Lỗi khi xóa ảnh cũ:", err.message);
          }
        }
      }
    }

    // 4. Cập nhật đường dẫn avatar mới
    const updatedUser = await prisma.users.update({
      where: { id: uId },
      data: { avatar_url: relativePath },
      select: { id: true, full_name: true, email: true, avatar_url: true },
    });

    // 5. Trả về full URL để hiển thị trực tiếp trên Trình duyệt / Postman
    const DOMAIN = process.env.APP_URL || "http://localhost:3069";
    return {
      ...updatedUser,
      avatar_url: `${DOMAIN}${updatedUser.avatar_url}`,
    };
  },
};
