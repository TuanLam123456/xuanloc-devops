import { waitlistService } from "../services/waitlist.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const waitlistController = {
  joinWaitlist: async (req, res, next) => {
    try {
      const { class_id } = req.body;
      const entry = await waitlistService.joinWaitlist(req.user.id, class_id);
      res.status(201).json(responseSuccess(entry, "Đã thêm vào danh sách chờ.", 201));
    } catch (error) {
      next(error);
    }
  },

  getWaitlistByClass: async (req, res, next) => {
    try {
      const list = await waitlistService.getWaitlistByClass(req.params.classId);
      res.status(200).json(responseSuccess(list, "Lấy danh sách chờ thành công."));
    } catch (error) {
      next(error);
    }
  },

  promote: async (req, res, next) => {
    try {
      const enrollment = await waitlistService.promoteFromWaitlist(req.params.id);
      res.status(200).json(responseSuccess(enrollment, "Chuyển từ danh sách chờ sang ghi danh thành công."));
    } catch (error) {
      next(error);
    }
  },

  remove: async (req, res, next) => {
    try {
      await waitlistService.removeFromWaitlist(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa khỏi danh sách chờ thành công."));
    } catch (error) {
      next(error);
    }
  },
};
