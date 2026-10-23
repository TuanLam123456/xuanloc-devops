import { gradeService } from "../services/grade.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const gradeController = {
  getMyGrades: async (req, res, next) => {
    try {
      const grades = await gradeService.getMyGrades(req.user.id);
      res.status(200).json(responseSuccess(grades, "Lấy bảng điểm thành công."));
    } catch (error) {
      next(error);
    }
  },

  addGrade: async (req, res, next) => {
    try {
      const grade = await gradeService.addGradeByTeacher(req.body, req.user);
      res.status(201).json(responseSuccess(grade, "Nhập điểm thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getGradesByEnrollment: async (req, res, next) => {
    try {
      const grades = await gradeService.getGradesByEnrollment(
        req.params.enrollmentId,
        req.user,
      );
      res.status(200).json(responseSuccess(grades, "Lấy danh sách điểm thành công."));
    } catch (error) {
      next(error);
    }
  },
};