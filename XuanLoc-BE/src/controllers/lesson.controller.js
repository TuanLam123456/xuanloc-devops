import { lessonService } from "../services/lesson.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const lessonController = {
  getLessonsByCourse: async (req, res, next) => {
    try {
      const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
      res.status(200).json(responseSuccess(lessons, "Lấy danh sách bài học thành công."));
    } catch (error) {
      next(error);
    }
  },

  createLesson: async (req, res, next) => {
    try {
      const lesson = await lessonService.createLessonByAdmin(req.body);
      res.status(201).json(responseSuccess(lesson, "Tạo bài học thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getClassLessonsProgress: async (req, res, next) => {
    try {
      const progress = await lessonService.getClassLessonsProgress(req.params.classId);
      res.status(200).json(responseSuccess(progress, "Lấy tiến độ bài học của lớp thành công."));
    } catch (error) {
      next(error);
    }
  },

  updateClassLessonStatus: async (req, res, next) => {
    try {
      const updated = await lessonService.updateClassLessonStatus(req.body, req.user);
      res.status(200).json(responseSuccess(updated, "Cập nhật tiến độ bài học thành công."));
    } catch (error) {
      next(error);
    }
  },

  addLessonMaterial: async (req, res, next) => {
    try {
      const material = await lessonService.addLessonMaterial(req.params.lessonId, req.body);
      res.status(201).json(responseSuccess(material, "Thêm tài liệu học tập thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  deleteLessonMaterial: async (req, res, next) => {
    try {
      await lessonService.deleteLessonMaterial(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa tài liệu học tập thành công."));
    } catch (error) {
      next(error);
    }
  },
};