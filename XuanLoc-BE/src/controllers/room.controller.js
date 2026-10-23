import { roomService } from "../services/room.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const roomController = {
  getAllRooms: async (req, res, next) => {
    try {
      const rooms = await roomService.getAllRooms();
      res.status(200).json(responseSuccess(rooms, "Lấy danh sách phòng học thành công."));
    } catch (error) {
      next(error);
    }
  },

  createRoom: async (req, res, next) => {
    try {
      const room = await roomService.createRoom(req.body);
      res.status(201).json(responseSuccess(room, "Tạo phòng học thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  updateRoom: async (req, res, next) => {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body);
      res.status(200).json(responseSuccess(room, "Cập nhật phòng học thành công."));
    } catch (error) {
      next(error);
    }
  },

  toggleRoomStatus: async (req, res, next) => {
    try {
      const { is_active } = req.body;
      const room = await roomService.toggleRoomStatus(req.params.id, is_active);
      res.status(200).json(responseSuccess(room, "Cập nhật trạng thái phòng học thành công."));
    } catch (error) {
      next(error);
    }
  },
};
