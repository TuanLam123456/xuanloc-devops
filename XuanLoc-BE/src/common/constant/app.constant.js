// File chứa hàm số lấy chung lấy từ .env
export const DATABASE_URL = process.env.DATABASE_URL;

export const JWT_SECRET_KEY = process.env.JWT_SECRET;

export const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

export const PORT = process.env.PORT || 3069;

// Số proxy đứng trước server (nginx = 1, Cloudflare + nginx = 2). 0 = gọi thẳng, không qua proxy.
// Cần đúng để req.ip là IP thật của người dùng, nếu không rate limit sẽ tính chung cho mọi người
export const TRUST_PROXY = Number(process.env.TRUST_PROXY) || 0;

// Danh sách origin được phép gọi API, phân tách bởi dấu phẩy trong .env (FRONTEND_URLS)
export const FRONTEND_URLS = (process.env.FRONTEND_URLS || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

// Tài khoản nhận chuyển khoản (dùng để sinh mã VietQR) - dùng cho ghi nhận học phí qua chuyển khoản
export const BANK_BIN = process.env.BANK_BIN;
export const BANK_ACCOUNT_NO = process.env.BANK_ACCOUNT_NO;
export const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME;
export const BANK_DISPLAY_NAME = process.env.BANK_DISPLAY_NAME || "MB Bank";