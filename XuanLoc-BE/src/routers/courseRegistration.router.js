import express from "express";
import { courseRegistrationController } from "../controllers/courseRegistration.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";
import { publicFormLimiter } from "../common/middlewares/rate-limit.middleware.js";

const registrationRouter = express.Router();

// Public: Khách đăng ký tư vấn từ Landing Page
registrationRouter.post(
  "/",
  publicFormLimiter,
  courseRegistrationController.createRegistration,
);

// Admin Management Routes
registrationRouter.get(
  "/",
  protect,
  checkRole("admin"),
  courseRegistrationController.getAllRegistrations
);

registrationRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  courseRegistrationController.updateRegistrationStatus
);

registrationRouter.delete(
  "/:id",
  protect,
  checkRole("admin"),
  courseRegistrationController.deleteRegistration
);

registrationRouter.patch(
  "/:id/assign",
  protect,
  checkRole("admin"),
  courseRegistrationController.assignRegistration,
);
registrationRouter.patch(
  "/:id/follow-up",
  protect,
  checkRole("admin"),
  courseRegistrationController.setFollowUpDate,
);
registrationRouter.post(
  "/:id/notes",
  protect,
  checkRole("admin"),
  courseRegistrationController.addNote,
);
registrationRouter.get(
  "/:id/notes",
  protect,
  checkRole("admin"),
  courseRegistrationController.getNotes,
);

export default registrationRouter;