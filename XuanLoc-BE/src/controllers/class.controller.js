import { classService } from "../services/class.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const classController = {
  // Public Controllers
  getClassesForPublic: async (req, res, next) => {
    try {
      const classes = await classService.getClassesForPublic(req.query);
      res
        .status(200)
        .json(
          responseSuccess(
            classes,
            "Lấy danh sách lớp học công khai thành công.",
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  getClassById: async (req, res, next) => {
    try {
      const foundClass = await classService.getClassById(req.params.id);
      res
        .status(200)
        .json(responseSuccess(foundClass, "Lấy chi tiết lớp học thành công."));
    } catch (error) {
      next(error);
    }
  },

  // Teacher Controller
  getMyTaughtClasses: async (req, res, next) => {
    try {
      const classes = await classService.getMyTaughtClasses(req.user.id);
      res
        .status(200)
        .json(
          responseSuccess(classes, "Lấy danh sách lớp giảng dạy thành công."),
        );
    } catch (error) {
      next(error);
    }
  },

  // Admin Controllers
  getAllClasses: async (req, res, next) => {
    try {
      const classes = await classService.getAllClassesByAdmin(req.query);
      res
        .status(200)
        .json(
          responseSuccess(classes, "Lấy danh sách quản lý lớp học thành công."),
        );
    } catch (error) {
      next(error);
    }
  },

  createClass: async (req, res, next) => {
    try {
      const newClass = await classService.createClassByAdmin(req.body);
      res
        .status(201)
        .json(
          responseSuccess(
            newClass,
            "Tạo lớp học mới và phân công thành công.",
            201,
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  updateClass: async (req, res, next) => {
    try {
      const updatedClass = await classService.updateClassByAdmin(
        req.params.id,
        req.body,
      );
      res
        .status(200)
        .json(responseSuccess(updatedClass, "Cập nhật lớp học thành công."));
    } catch (error) {
      next(error);
    }
  },

  deleteClass: async (req, res, next) => {
    try {
      await classService.deleteClassByAdmin(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa lớp học thành công."));
    } catch (error) {
      next(error);
    }
  },
};
