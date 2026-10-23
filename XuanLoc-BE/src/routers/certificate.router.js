import express from "express";
import { certificateController } from "../controllers/certificate.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const certificateRouter = express.Router();

// Public: xác minh chứng chỉ qua mã (đặt trước "/:id" để không bị nuốt bởi route động)
certificateRouter.get("/verify/:code", certificateController.verifyCertificate);

// Học viên: xem danh sách chứng chỉ của chính mình (đặt trước "/:id" để không bị nuốt bởi route động)
certificateRouter.get(
  "/my-certificates",
  protect,
  checkRole("student"),
  certificateController.getMyCertificates,
);

certificateRouter.post(
  "/",
  protect,
  checkRole("admin"),
  certificateController.issueCertificate,
);
certificateRouter.get(
  "/",
  protect,
  checkRole("admin"),
  certificateController.getAllCertificates,
);
certificateRouter.get(
  "/:id/download",
  protect,
  certificateController.downloadCertificate,
);

export default certificateRouter;
