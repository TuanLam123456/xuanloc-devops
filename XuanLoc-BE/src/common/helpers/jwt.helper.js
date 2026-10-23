// hàm tạo access token - refresh token
// access token:
// - thời gian sống ngắn (1h-2h)
// - chứa thông tin người dùng (id,email,role)
// - lưu trong localStorage

// refresh token:
// - cấp mới access token khi access token hết hạn
// - thời gian sống dài (7-30d)
// - không chứa thông tin người dùng, chỉ chứa id của refresh token
// - lưu trong httpOnly cookie
import jwt from "jsonwebtoken";
import {
  JWT_REFRESH_SECRET_KEY,
  JWT_SECRET_KEY,
} from "../constant/app.constant.js";

export const signAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "15m" });
};

export const verifyAccessToken = (token, options) => {
  return jwt.verify(token, JWT_SECRET_KEY, options);
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET_KEY);
};