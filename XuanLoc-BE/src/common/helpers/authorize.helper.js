import { prisma } from "../prisma/connect.prisma.js";
import { ForbiddenError, NotFoundError } from "./exception.helper.js";

// Chỉ giáo viên phụ trách lớp (hoặc admin) mới được điểm danh / nhập điểm / cập nhật
// tiến độ của lớp đó. Admin luôn được bỏ qua kiểm tra này.
export const assertTeacherOwnsClass = async (classId, requestingUser) => {
  if (requestingUser?.role !== "teacher") return;

  const foundClass = await prisma.classes.findUnique({
    where: { id: classId },
    select: { teacher_id: true },
  });

  if (!foundClass) {
    throw new NotFoundError("Không tìm thấy lớp học.");
  }

  if (foundClass.teacher_id !== requestingUser.id) {
    throw new ForbiddenError("Bạn không phụ trách lớp học này.");
  }
};
