import express from "express";
import { authController } from "../controllers/auth.controller.js";
import { protect } from "../common/middlewares/auth.middleware.js";
import { strictAuthLimiter } from "../common/middlewares/rate-limit.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", strictAuthLimiter, authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.get("/me", protect, authController.getMe);
authRouter.post("/logout", protect, authController.logout);

export default authRouter;