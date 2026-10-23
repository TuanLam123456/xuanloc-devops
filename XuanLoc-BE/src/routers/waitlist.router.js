import express from "express";
import { waitlistController } from "../controllers/waitlist.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const waitlistRouter = express.Router();

waitlistRouter.post("/", protect, checkRole("student"), waitlistController.joinWaitlist);
waitlistRouter.get(
  "/class/:classId",
  protect,
  checkRole("admin"),
  waitlistController.getWaitlistByClass,
);
waitlistRouter.post(
  "/:id/promote",
  protect,
  checkRole("admin"),
  waitlistController.promote,
);
waitlistRouter.delete("/:id", protect, checkRole("admin"), waitlistController.remove);

export default waitlistRouter;
