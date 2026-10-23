import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";

// Dùng lại ở class.service.js/schedule.service.js để validate tên phòng khi tạo/sửa lớp & lịch học
export const assertValidRoom = async (roomName) => {
  const room = await prisma.rooms.findFirst({
    where: { name: roomName, is_active: true },
  });

  if (!room) {
    throw new BadRequestError(
      `Phòng học "${roomName}" không tồn tại hoặc đã ngừng sử dụng.`,
    );
  }
};

export const roomService = {
  // Danh sách phòng học (tập dữ liệu nhỏ, không cần phân trang)
  getAllRooms: async () => {
    return await prisma.rooms.findMany({ orderBy: { name: "asc" } });
  },

  createRoom: async (body) => {
    const { name, capacity, note } = body;

    if (!name) {
      throw new BadRequestError("Vui lòng nhập tên phòng học.");
    }

    const existing = await prisma.rooms.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestError("Tên phòng học này đã tồn tại.");
    }

    return await prisma.rooms.create({
      data: {
        name,
        capacity: capacity ? Number(capacity) : null,
        note: note || null,
      },
    });
  },

  updateRoom: async (id, body) => {
    const roomId = Number(id);
    const { name, capacity, note } = body;

    const room = await prisma.rooms.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundError("Không tìm thấy phòng học.");
    }

    if (name && name !== room.name) {
      const existing = await prisma.rooms.findUnique({ where: { name } });
      if (existing) {
        throw new BadRequestError("Tên phòng học mới đã bị trùng.");
      }
    }

    return await prisma.rooms.update({
      where: { id: roomId },
      data: {
        ...(name && { name }),
        ...(capacity !== undefined && { capacity: capacity ? Number(capacity) : null }),
        ...(note !== undefined && { note }),
      },
    });
  },

  // Bật/tắt phòng học (không hard-delete, theo pattern is_active của courses)
  toggleRoomStatus: async (id, is_active) => {
    const roomId = Number(id);

    const room = await prisma.rooms.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundError("Không tìm thấy phòng học.");
    }

    return await prisma.rooms.update({
      where: { id: roomId },
      data: { is_active: Boolean(is_active) },
    });
  },
};
