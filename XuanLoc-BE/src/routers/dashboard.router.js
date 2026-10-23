import express from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get(
  "/overview",
  protect,
  checkRole("admin"),
  dashboardController.getOverview,
);
dashboardRouter.get(
  "/revenue-trend",
  protect,
  checkRole("admin"),
  dashboardController.getRevenueTrend,
);

export default dashboardRouter;
