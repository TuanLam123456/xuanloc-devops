import { responseErr } from "./response.helper.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Prisma } from "../prisma/generated/prisma/index.js";
import { statusCodes } from "./status-code.helper.js";

// middleware bắt lỗi, không được phép xảy ra lỗi mà không được xử lý, không được tồn tại lỗi từ logic
export const appError = (err, req, res, next) => {
  console.error("Lỗi ở middleware đặc biệt xử lý lỗi:", err);

  // lỗi do token không hợp lệ
  if (err instanceof jwt.JsonWebTokenError) {
    // class JwtError là bắt tất cả lỗi liên quan đến jwt, bao gồm tất cả lỗi liên quan đến token
    err.statusCode = statusCodes.FORBIDDEN; // 403: fe sẽ refresh token
  }

  // lỗi do token hết hạn
  if (err instanceof jwt.TokenExpiredError) {
    // class tokenExpiredError chỉ bắt tất cả lỗi liên quan đến token hết hạn
    err.statusCode = statusCodes.UNAUTHORIZED; // 401: fe sẽ logout người dùng
  }

  // lỗi từ Prisma (vi phạm ràng buộc DB) -> map sang mã lỗi nghiệp vụ phù hợp
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      err.statusCode = statusCodes.CONFLICT;
      err.message = "Dữ liệu đã tồn tại (vi phạm ràng buộc duy nhất).";
    } else if (err.code === "P2003") {
      err.statusCode = statusCodes.BAD_REQUEST;
      err.message = "Dữ liệu liên kết không hợp lệ hoặc không tồn tại.";
    } else if (err.code === "P2025") {
      err.statusCode = statusCodes.NOT_FOUND;
      err.message = "Không tìm thấy dữ liệu.";
    }
  }

  // lỗi từ Multer (vd. vượt dung lượng file cho phép)
  if (err instanceof multer.MulterError) {
    err.statusCode = statusCodes.BAD_REQUEST;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = err?.statusCode || statusCodes.INTERNAL_SERVER_ERROR;

  const response = responseErr(
    err?.message,
    statusCode,
    isProduction ? undefined : err?.stack,
  );

  res.status(response.statusCode).json(response);
};
