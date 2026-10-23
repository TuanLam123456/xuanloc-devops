import { payrollService } from "../services/payroll.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
import { sendExcelFile } from "../common/helpers/excel.helper.js";
import { ForbiddenError } from "../common/helpers/exception.helper.js";

export const payrollController = {
  getAllPayroll: async (req, res, next) => {
    try {
      const payroll = await payrollService.getAllPayrollByAdmin(req.query);
      res.status(200).json(responseSuccess(payroll, "Lấy bảng lương thành công."));
    } catch (error) {
      next(error);
    }
  },

  getTeacherPayroll: async (req, res, next) => {
    try {
      const teacherId = Number(req.params.teacherId);
      const isSelf = req.user.role === "teacher" && req.user.id === teacherId;
      if (!isSelf && req.user.role !== "admin") {
        throw new ForbiddenError("Bạn không có quyền xem lương của giáo viên khác.");
      }
      const payroll = await payrollService.getTeacherPayroll(teacherId, req.query);
      res.status(200).json(responseSuccess(payroll, "Lấy lương giáo viên thành công."));
    } catch (error) {
      next(error);
    }
  },

  exportPayroll: async (req, res, next) => {
    try {
      const payroll = await payrollService.getAllPayrollByAdmin(req.query);

      await sendExcelFile(res, {
        fileName: `bang-luong-${payroll.month}-${payroll.year}.xlsx`,
        sheetName: "Bảng lương",
        columns: [
          { header: "Mã GV", key: "teacher_id", width: 10 },
          { header: "Giáo viên", key: "teacher_name", width: 26 },
          { header: "Số buổi dạy", key: "sessions_completed", width: 14 },
          { header: "Đơn giá/buổi", key: "rate_per_session", width: 16 },
          { header: "Tổng lương", key: "total_pay", width: 16 },
        ],
        rows: payroll.rows,
      });
    } catch (error) {
      next(error);
    }
  },
};
