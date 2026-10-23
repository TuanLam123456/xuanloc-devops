import express from "express";
import { voucherController } from "../controllers/voucher.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const voucherRouter = express.Router();

voucherRouter.post("/", protect, checkRole("admin"), voucherController.createVoucher);
voucherRouter.get("/", protect, checkRole("admin"), voucherController.getAllVouchers);
voucherRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  voucherController.toggleVoucherStatus,
);

export default voucherRouter;
