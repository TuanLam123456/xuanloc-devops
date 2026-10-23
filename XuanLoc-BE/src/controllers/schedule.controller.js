import { scheduleService } from "../services/schedule.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const scheduleController = {
  getStudentSchedule: async (req, res, next) => {
    try {
      const schedule = await scheduleService.getStudentSchedule(req.user.id, req.query);
      res
        .status(200)
        .json(
          responseSuccess(schedule, "Lấy thời khóa biểu cá nhân thành công.")
        );
    } catch (error) {
      next(error);
    }
  },

  getTeacherSchedule: async (req, res, next) => {
    try {
      const schedule = await scheduleService.getTeacherSchedule(req.user.id, req.query);
      res
        .status(200)
        .json(
          responseSuccess(schedule, "Lấy lịch giảng dạy cá nhân thành công.")
        );
    } catch (error) {
      next(error);
    }
  },

  getSchedulesByClass: async (req, res, next) => {
    try {
      const schedule = await scheduleService.getSchedulesByClass(
        req.params.classId,
        req.query,
      );
      res
        .status(200)
        .json(
          responseSuccess(schedule, "Lấy danh sách lịch học thành công.")
        );
    } catch (error) {
      next(error);
    }
  },

  createSchedule: async (req, res, next) => {
    try {
      const newSchedule = await scheduleService.createScheduleByAdmin(
        req.body
      );
      res
        .status(201)
        .json(
          responseSuccess(newSchedule, "Tạo buổi học mới thành công.", 201)
        );
    } catch (error) {
      next(error);
    }
  },

  updateSchedule: async (req, res, next) => {
    try {
      const updatedSchedule = await scheduleService.updateScheduleByAdmin(
        req.params.id,
        req.body
      );
      res
        .status(200)
        .json(
          responseSuccess(updatedSchedule, "Cập nhật buổi học thành công.")
        );
    } catch (error) {
      next(error);
    }
  },

  deleteSchedule: async (req, res, next) => {
    try {
      await scheduleService.deleteScheduleByAdmin(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa buổi học thành công."));
    } catch (error) {
      next(error);
    }
  },
};