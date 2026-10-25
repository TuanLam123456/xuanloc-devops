import { attendanceService } from "../services/attendance.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const attendanceController = {
  getMyAttendance: async (req, res, next) => {
    try {
      const attendance = await attendanceService.getMyAttendance(
        req.user.id,
        req.query
      );
      res
        .status(200)
        .json(responseSuccess(attendance, "Lấy lịch sử chuyên cần thành công."));
    } catch (error) {
      next(error);
    }
  },

  getAttendanceByClassAndDate: async (req, res, next) => {
    try {
      const { classId } = req.params;
      const { date } = req.query;
      const attendance = await attendanceService.getAttendanceByClassAndDate(
        classId,
        date,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(attendance, "Lấy danh sách điểm danh thành công."));
    } catch (error) {
      next(error);
    }
  },

  saveBatchAttendance: async (req, res, next) => {
    try {
      const result = await attendanceService.saveBatchAttendance(req.body, req.user);
      res
        .status(200)
        .json(responseSuccess(result, "Lưu thông tin điểm danh thành công."));
    } catch (error) {
      next(error);
    }
  },

  updateAttendanceRecord: async (req, res, next) => {
    try {
      const updated = await attendanceService.updateAttendanceRecord(
        req.params.id,
        req.body,
        req.user,
      );
      res
        .status(200)
        .json(responseSuccess(updated, "Cập nhật điểm danh thành công."));
    } catch (error) {
      next(error);
    }
  },
};
