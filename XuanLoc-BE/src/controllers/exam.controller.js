import { examService } from "../services/exam.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const examController = {
  createExam: async (req, res, next) => {
    try {
      const exam = await examService.createExam(req.body);
      res.status(201).json(responseSuccess(exam, "Tạo bài kiểm tra thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getExamsByCourse: async (req, res, next) => {
    try {
      const exams = await examService.getExamsByCourse(req.params.courseId, req.user);
      res.status(200).json(responseSuccess(exams, "Lấy danh sách bài kiểm tra thành công."));
    } catch (error) {
      next(error);
    }
  },

  getExamDetail: async (req, res, next) => {
    try {
      const exam = await examService.getExamDetailByAdmin(req.params.id);
      res.status(200).json(responseSuccess(exam, "Lấy chi tiết bài kiểm tra thành công."));
    } catch (error) {
      next(error);
    }
  },

  getExamForTaking: async (req, res, next) => {
    try {
      const exam = await examService.getExamForTaking(req.params.id, req.user.id);
      res.status(200).json(responseSuccess(exam, "Lấy đề bài kiểm tra thành công."));
    } catch (error) {
      next(error);
    }
  },

  submitExam: async (req, res, next) => {
    try {
      const { answers } = req.body;
      const result = await examService.submitExam(req.params.id, req.user.id, answers);
      res.status(200).json(responseSuccess(result, "Nộp bài thành công."));
    } catch (error) {
      next(error);
    }
  },

  getSubmissions: async (req, res, next) => {
    try {
      const submissions = await examService.getSubmissionsByAdmin(req.params.id);
      res.status(200).json(responseSuccess(submissions, "Lấy danh sách bài nộp thành công."));
    } catch (error) {
      next(error);
    }
  },

  updateExam: async (req, res, next) => {
    try {
      const exam = await examService.updateExamByAdmin(req.params.id, req.body);
      res.status(200).json(responseSuccess(exam, "Cập nhật bài kiểm tra thành công."));
    } catch (error) {
      next(error);
    }
  },

  deleteExam: async (req, res, next) => {
    try {
      await examService.deleteExamByAdmin(req.params.id);
      res.status(200).json(responseSuccess(null, "Xóa bài kiểm tra thành công."));
    } catch (error) {
      next(error);
    }
  },
};
