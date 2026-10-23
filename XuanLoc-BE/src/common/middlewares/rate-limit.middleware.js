import rateLimit from "express-rate-limit";
import { statusCodes } from "../helpers/status-code.helper.js";
import { responseErr } from "../helpers/response.helper.js";

const handler = (message) => (req, res) => {
  res
    .status(statusCodes.TOO_MANY_REQUESTS)
    .json(responseErr(message, statusCodes.TOO_MANY_REQUESTS));
};

// Áp cho các endpoint nhạy cảm dễ bị brute-force: login, quên mật khẩu, nhập mã OTP
export const strictAuthLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút."),
});

// Áp cho form public dễ bị spam (đăng ký tư vấn)
export const publicFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút."),
});

// Áp mặc định cho toàn bộ API còn lại, chặn spam/quét endpoint hàng loạt
export const generalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Hệ thống đang nhận quá nhiều yêu cầu từ bạn. Vui lòng thử lại sau ít phút."),
});
