import { voucherService } from "../services/voucher.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const voucherController = {
  createVoucher: async (req, res, next) => {
    try {
      const voucher = await voucherService.createVoucher(req.body);
      res.status(201).json(responseSuccess(voucher, "Tạo voucher thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  getAllVouchers: async (req, res, next) => {
    try {
      const vouchers = await voucherService.getAllVouchers(req.query);
      res.status(200).json(responseSuccess(vouchers, "Lấy danh sách voucher thành công."));
    } catch (error) {
      next(error);
    }
  },

  toggleVoucherStatus: async (req, res, next) => {
    try {
      const { is_active } = req.body;
      const voucher = await voucherService.toggleVoucherStatus(req.params.id, is_active);
      res.status(200).json(responseSuccess(voucher, "Cập nhật trạng thái voucher thành công."));
    } catch (error) {
      next(error);
    }
  },
};
