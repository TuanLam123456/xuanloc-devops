import express from "express";
import { examController } from "../controllers/exam.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const examRouter = express.Router();

examRouter.post("/", protect, checkRole("admin", "teacher"), examController.createExam);
examRouter.get("/course/:courseId", protect, examController.getExamsByCourse);

examRouter.get(
  "/:id/take",
  protect,
  checkRole("student"),
  examController.getExamForTaking,
);
examRouter.post(
  "/:id/submit",
  protect,
  checkRole("student"),
  examController.submitExam,
);
examRouter.get(
  "/:id/submissions",
  protect,
  checkRole("admin", "teacher"),
  examController.getSubmissions,
);

examRouter.get("/:id", protect, checkRole("admin", "teacher"), examController.getExamDetail);
examRouter.put("/:id", protect, checkRole("admin", "teacher"), examController.updateExam);
examRouter.delete("/:id", protect, checkRole("admin", "teacher"), examController.deleteExam);

export default examRouter;
