import express from "express";
import { gradeController } from "../controllers/grade.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const gradeRouter = express.Router();

gradeRouter.get("/my-grades", protect, checkRole("student"), gradeController.getMyGrades);
gradeRouter.get("/enrollment/:enrollmentId", protect, gradeController.getGradesByEnrollment);
gradeRouter.post("/", protect, checkRole("teacher", "admin"), gradeController.addGrade);

export default gradeRouter;