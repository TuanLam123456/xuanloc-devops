import { dashboardService } from "../services/dashboard.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const dashboardController = {
  getOverview: async (req, res, next) => {
    try {
      const overview = await dashboardService.getOverview();
      res.status(200).json(responseSuccess(overview, "Lấy thống kê tổng quan thành công."));
    } catch (error) {
      next(error);
    }
  },

  getRevenueTrend: async (req, res, next) => {
    try {
      const trend = await dashboardService.getRevenueTrend(req.query.months);
      res.status(200).json(responseSuccess(trend, "Lấy xu hướng doanh thu thành công."));
    } catch (error) {
      next(error);
    }
  },
};
