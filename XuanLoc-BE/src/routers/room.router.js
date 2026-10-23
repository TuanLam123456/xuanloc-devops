import express from "express";
import { roomController } from "../controllers/room.controller.js";
import { protect, checkRole } from "../common/middlewares/auth.middleware.js";

const roomRouter = express.Router();

// Mọi role đăng nhập đều cần xem danh sách phòng (vd. giáo viên tạo lịch học)
roomRouter.get("/", protect, roomController.getAllRooms);

roomRouter.post("/", protect, checkRole("admin"), roomController.createRoom);
roomRouter.put("/:id", protect, checkRole("admin"), roomController.updateRoom);
roomRouter.patch(
  "/:id/status",
  protect,
  checkRole("admin"),
  roomController.toggleRoomStatus,
);

export default roomRouter;
