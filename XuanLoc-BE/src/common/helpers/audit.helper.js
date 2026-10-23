import { prisma } from "../prisma/connect.prisma.js";

// Ghi nhật ký cho các thao tác nhạy cảm (admin sửa/xóa dữ liệu người khác, thao tác tài chính...).
// Không bao giờ throw ra ngoài - lỗi ghi log không được phép làm hỏng nghiệp vụ chính.
export const logActivity = async ({ userId, role, action, entityType, entityId, meta }) => {
  try {
    await prisma.activity_logs.create({
      data: {
        user_id: userId ?? null,
        user_role: role ?? null,
        action,
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
        meta: meta ?? undefined,
      },
    });
  } catch (err) {
    console.error("Lỗi ghi audit log:", err.message);
  }
};
