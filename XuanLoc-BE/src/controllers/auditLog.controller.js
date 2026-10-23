import { auditLogService } from "../services/auditLog.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const auditLogController = {
  getAllLogs: async (req, res, next) => {
    try {
      const logs = await auditLogService.getAllLogsByAdmin(req.query);
      res.status(200).json(responseSuccess(logs, "Lấy nhật ký hoạt động thành công."));
    } catch (error) {
      next(error);
    }
  },
};
