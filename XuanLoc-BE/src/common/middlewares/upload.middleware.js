import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { BadRequestError } from "../helpers/exception.helper.js";

// Khởi tạo và kiểm tra thư mục uploads/avatars
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const dateFormatted = Date.now();
    const randomSuffix = crypto.randomUUID();
    // Đặt tên dạng: Avatar-1770526000000-<uuid>.png (random suffix tránh trùng tên cùng mili-giây)
    const fileName = `Avatar-${dateFormatted}-${randomSuffix}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  }
  cb(new BadRequestError("Chỉ chấp nhận các định dạng ảnh: jpg, jpeg, png, webp."));
};

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
  fileFilter,
}).single("avatar");