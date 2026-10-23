import { prisma } from "../common/prisma/connect.prisma.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";

export const auditLogService = {
  getAllLogsByAdmin: async (query) => {
    const { action, entity_type, user_id } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(action && { action }),
      ...(entity_type && { entity_type }),
      ...(user_id && { user_id: Number(user_id) }),
    };

    const [logs, total] = await Promise.all([
      prisma.activity_logs.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.activity_logs.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(logs, total, page, pageSize);
  },
};
