import { prisma } from "../common/prisma/connect.prisma.js";
import { BadRequestError, NotFoundError } from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";

export const voucherService = {
  createVoucher: async (body) => {
    const { code, discount_type, discount_value, max_uses, valid_from, valid_to } = body;

    if (!code || !discount_value) {
      throw new BadRequestError("Vui lòng nhập code và discount_value.");
    }
    if (discount_type && !["percent", "fixed"].includes(discount_type)) {
      throw new BadRequestError("discount_type chỉ chấp nhận 'percent' hoặc 'fixed'.");
    }

    const existing = await prisma.vouchers.findUnique({ where: { code } });
    if (existing) throw new BadRequestError("Mã voucher này đã tồn tại.");

    return await prisma.vouchers.create({
      data: {
        code,
        discount_type: discount_type || "fixed",
        discount_value: Number(discount_value),
        max_uses: max_uses != null ? Number(max_uses) : null,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_to: valid_to ? new Date(valid_to) : null,
      },
    });
  },

  getAllVouchers: async (query) => {
    const { is_active } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(is_active !== undefined && { is_active: is_active === "true" }),
    };

    const [vouchers, total] = await Promise.all([
      prisma.vouchers.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.vouchers.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(vouchers, total, page, pageSize);
  },

  toggleVoucherStatus: async (id, is_active) => {
    const voucherId = Number(id);
    const voucher = await prisma.vouchers.findUnique({ where: { id: voucherId } });
    if (!voucher) throw new NotFoundError("Không tìm thấy voucher.");

    return await prisma.vouchers.update({
      where: { id: voucherId },
      data: { is_active: Boolean(is_active) },
    });
  },
};
