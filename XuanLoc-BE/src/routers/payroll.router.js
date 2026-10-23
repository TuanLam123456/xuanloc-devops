import express from "express";
import { payrollController } from "../controllers/payroll.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const payrollRouter = express.Router();

payrollRouter.get("/", protect, checkRole("admin"), payrollController.getAllPayroll);
payrollRouter.get("/export", protect, checkRole("admin"), payrollController.exportPayroll);
payrollRouter.get(
  "/:teacherId",
  protect,
  checkRole("admin", "teacher"),
  payrollController.getTeacherPayroll,
);

export default payrollRouter;
