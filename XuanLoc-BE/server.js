import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logAPI } from './src/common/middlewares/log-api.middleware.js';
import { appError } from './src/common/helpers/appError.helper.js';
import rootRouter from './src/routers/root.router.js';
import path from "path";
import { PORT, FRONTEND_URLS } from "./src/common/constant/app.constant.js";
import { generalApiLimiter } from "./src/common/middlewares/rate-limit.middleware.js";

const app = express();

app.use(express.json());

// Origin cho phép được cấu hình qua FRONTEND_URLS trong .env (phân tách bởi dấu phẩy)
app.use(
  cors({
    origin: FRONTEND_URLS,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(logAPI);

// Cấu hình static folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check - FE/CI dùng để biết BE còn sống, không cần đăng nhập
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", generalApiLimiter, rootRouter);

app.use(appError);

app.listen(PORT, () => {
  console.log(`Server online at port: ${PORT}`);
});