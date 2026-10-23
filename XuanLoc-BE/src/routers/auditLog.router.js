import express from "express";
import { auditLogController } from "../controllers/auditLog.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const auditLogRouter = express.Router();

auditLogRouter.get("/", protect, checkRole("admin"), auditLogController.getAllLogs);

export default auditLogRouter;
