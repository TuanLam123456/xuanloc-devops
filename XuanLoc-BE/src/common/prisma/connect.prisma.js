import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/index.js";
import { DATABASE_URL } from "../constant/app.constant.js";

const url = new URL(DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.substring(1),
  connectionLimit: 5,
  // MySQL 8.4+ xác thực bằng caching_sha2_password: kết nối không TLS cần lấy RSA public key từ server.
  // Thiếu option này thì sau khi MySQL khởi động lại sẽ lỗi ER_CANNOT_RETRIEVE_RSA_KEY (chỉ kết nối trong mạng nội bộ Docker)
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({
  adapter,
  omit: {
    users: {
      password: true,
      codeChangePass: true,
      codeChangePass_expires_at: true,
      codeChangePass_attempts: true,
      refresh_token: true,
    },
  },
});

try {
  await prisma.$connect();
  console.log(`[PRISMA] connection has been established successfully`);
} catch (error) {
  console.error(`[PRISMA] is unable to connect to the database:`, error);
}

export { prisma };