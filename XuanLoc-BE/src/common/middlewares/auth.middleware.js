import {
  UnauthorizedError,
  ForbiddenError,
} from "../helpers/exception.helper.js";
import { verifyAccessToken } from "../helpers/jwt.helper.js";

export const protect = (req, res, next) => {
  // Đọc accessToken từ Cookie thay vì Headers
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new UnauthorizedError(
      "Bạn chưa đăng nhập. Không tìm thấy Access Token trong Cookie.",
    );
  }

  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
};

export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Bạn không có quyền thực hiện thao tác này.");
    }
    next();
  };
};
