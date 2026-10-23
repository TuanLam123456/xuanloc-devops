import { courseService } from "../services/course.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const courseController = {
  // Public Controllers
  getCoursesForPublic: async (req, res, next) => {
    try {
      const courses = await courseService.getCoursesForPublic();
      res
        .status(200)
        .json(responseSuccess(courses, "Lấy danh sách khóa học thành công."));
    } catch (error) {
      next(error);
    }
  },

  getCourseById: async (req, res, next) => {
    try {
      const course = await courseService.getCourseById(req.params.id);
      res
        .status(200)
        .json(responseSuccess(course, "Lấy chi tiết khóa học thành công."));
    } catch (error) {
      next(error);
    }
  },

  // Admin Controllers
  getAllCourses: async (req, res, next) => {
    try {
      const courses = await courseService.getAllCoursesByAdmin(req.query);
      res
        .status(200)
        .json(responseSuccess(courses, "Lấy danh sách quản lý khóa học thành công."));
    } catch (error) {
      next(error);
    }
  },

  createCourse: async (req, res, next) => {
    try {
      const newCourse = await courseService.createCourseByAdmin(req.body);
      res
        .status(201)
        .json(responseSuccess(newCourse, "Tạo khóa học mới thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  updateCourse: async (req, res, next) => {
    try {
      const updatedCourse = await courseService.updateCourseByAdmin(
        req.params.id,
        req.body
      );
      res
        .status(200)
        .json(responseSuccess(updatedCourse, "Cập nhật khóa học thành công."));
    } catch (error) {
      next(error);
    }
  },

  toggleCourseStatus: async (req, res, next) => {
    try {
      const { is_active } = req.body;
      const updatedCourse = await courseService.toggleCourseStatusByAdmin(
        req.params.id,
        is_active
      );
      res
        .status(200)
        .json(
          responseSuccess(
            updatedCourse,
            "Cập nhật trạng thái khóa học thành công."
          )
        );
    } catch (error) {
      next(error);
    }
  },

  deleteCourse: async (req, res, next) => {
    try {
      await courseService.deleteCourseByAdmin(req.params.id);
      res
        .status(200)
        .json(responseSuccess(null, "Xóa khóa học thành công."));
    } catch (error) {
      next(error);
    }
  },
};