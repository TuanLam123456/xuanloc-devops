import { courseRegistrationService } from "../services/courseRegistration.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const courseRegistrationController = {
  createRegistration: async (req, res, next) => {
    try {
      const registration =
        await courseRegistrationService.createRegistrationByPublic(req.body);
      res
        .status(201)
        .json(
          responseSuccess(
            registration,
            "Gửi yêu cầu đăng ký tư vấn thành công! Trung tâm sẽ liên hệ bạn sớm nhất.",
            201
          )
        );
    } catch (error) {
      next(error);
    }
  },

  getAllRegistrations: async (req, res, next) => {
    try {
      const list =
        await courseRegistrationService.getAllRegistrationsByAdmin(req.query);
      res
        .status(200)
        .json(
          responseSuccess(list, "Lấy danh sách đăng ký tư vấn thành công.")
        );
    } catch (error) {
      next(error);
    }
  },

  updateRegistrationStatus: async (req, res, next) => {
    try {
      const updated =
        await courseRegistrationService.updateRegistrationStatusByAdmin(
          req.params.id,
          req.body
        );
      res
        .status(200)
        .json(
          responseSuccess(
            updated,
            "Cập nhật trạng thái đơn đăng ký thành công."
          )
        );
    } catch (error) {
      next(error);
    }
  },

  deleteRegistration: async (req, res, next) => {
    try {
      await courseRegistrationService.deleteRegistrationByAdmin(
        req.params.id
      );
      res
        .status(200)
        .json(responseSuccess(null, "Xóa đơn đăng ký tư vấn thành công."));
    } catch (error) {
      next(error);
    }
  },

  assignRegistration: async (req, res, next) => {
    try {
      const { assigned_to } = req.body;
      const updated = await courseRegistrationService.assignRegistrationByAdmin(
        req.params.id,
        assigned_to,
      );
      res.status(200).json(responseSuccess(updated, "Gán phụ trách thành công."));
    } catch (error) {
      next(error);
    }
  },

  setFollowUpDate: async (req, res, next) => {
    try {
      const { follow_up_date } = req.body;
      const updated = await courseRegistrationService.setFollowUpDateByAdmin(
        req.params.id,
        follow_up_date,
      );
      res.status(200).json(responseSuccess(updated, "Đặt lịch theo dõi thành công."));
    } catch (error) {
      next(error);
    }
  },

  addNote: async (req, res, next) => {
    try {
      const { note } = req.body;
      const created = await courseRegistrationService.addRegistrationNote(
        req.params.id,
        req.user.id,
        note,
      );
      res.status(201).json(responseSuccess(created, "Thêm ghi chú thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getNotes: async (req, res, next) => {
    try {
      const notes = await courseRegistrationService.getRegistrationNotes(req.params.id);
      res.status(200).json(responseSuccess(notes, "Lấy ghi chú thành công."));
    } catch (error) {
      next(error);
    }
  },
};