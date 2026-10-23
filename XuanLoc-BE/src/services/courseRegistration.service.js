import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";

export const courseRegistrationService = {
  // 1. PUBLIC: Khách gửi form đăng ký tư vấn ngoài Landing Page
  createRegistrationByPublic: async (body) => {
    const { course_id, full_name, email, phone, note, source, referral_code } = body;

    if (!course_id || !full_name || !email || !phone) {
      throw new BadRequestError(
        "Vui lòng điền đầy đủ: Khóa học, Họ tên, Email và Số điện thoại."
      );
    }

    const cId = Number(course_id);
    if (isNaN(cId)) throw new BadRequestError("ID khóa học không hợp lệ.");

    const course = await prisma.courses.findUnique({ where: { id: cId } });
    if (!course) throw new NotFoundError("Khóa học không tồn tại.");

    const validSources = ["facebook", "zalo", "walkin", "referral", "other"];

    return await prisma.course_registrations.create({
      data: {
        course_id: cId,
        full_name,
        email,
        phone,
        note: note || null,
        status: "pending",
        source: validSources.includes(source) ? source : "other",
        referred_by_code: referral_code || null,
      },
    });
  },

  // 2. ADMIN: Lấy danh sách các đơn đăng ký tư vấn (lọc theo status / course_id / source / assigned_to)
  getAllRegistrationsByAdmin: async (query) => {
    const { status, course_id, source, assigned_to } = query;
    const { page, pageSize, skip, take } = getPagination(query);

    const whereCondition = {
      ...(status && { status }),
      ...(course_id && { course_id: Number(course_id) }),
      ...(source && { source }),
      ...(assigned_to && { assigned_to: Number(assigned_to) }),
    };

    const [registrations, total] = await Promise.all([
      prisma.course_registrations.findMany({
        where: whereCondition,
        include: {
          courses: {
            select: { id: true, code: true, title: true, tuition_fee: true },
          },
          users: { select: { id: true, full_name: true } },
          _count: { select: { registration_notes: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.course_registrations.count({ where: whereCondition }),
    ]);

    return buildPaginatedResult(registrations, total, page, pageSize);
  },

  // 2b. ADMIN: Gán lead cho nhân viên phụ trách
  assignRegistrationByAdmin: async (id, assignedToUserId) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");

    const existingReg = await prisma.course_registrations.findUnique({
      where: { id: regId },
    });
    if (!existingReg) throw new NotFoundError("Không tìm thấy đơn đăng ký.");

    const assignee = await prisma.users.findUnique({
      where: { id: Number(assignedToUserId) },
    });
    if (!assignee) throw new BadRequestError("Nhân viên phụ trách không hợp lệ.");

    return await prisma.course_registrations.update({
      where: { id: regId },
      data: { assigned_to: Number(assignedToUserId) },
    });
  },

  // 2c. ADMIN: Đặt lịch hẹn theo dõi tiếp theo
  setFollowUpDateByAdmin: async (id, followUpDate) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");
    if (!followUpDate) throw new BadRequestError("Vui lòng cung cấp follow_up_date.");

    const existingReg = await prisma.course_registrations.findUnique({
      where: { id: regId },
    });
    if (!existingReg) throw new NotFoundError("Không tìm thấy đơn đăng ký.");

    return await prisma.course_registrations.update({
      where: { id: regId },
      data: { follow_up_date: new Date(followUpDate) },
    });
  },

  // 2d. ADMIN: Ghi chú lịch sử chăm sóc lead
  addRegistrationNote: async (id, adminUserId, note) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");
    if (!note) throw new BadRequestError("Vui lòng nhập nội dung ghi chú.");

    const existingReg = await prisma.course_registrations.findUnique({
      where: { id: regId },
    });
    if (!existingReg) throw new NotFoundError("Không tìm thấy đơn đăng ký.");

    return await prisma.registration_notes.create({
      data: {
        registration_id: regId,
        created_by: adminUserId || null,
        note,
      },
    });
  },

  getRegistrationNotes: async (id) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");

    return await prisma.registration_notes.findMany({
      where: { registration_id: regId },
      include: { users: { select: { id: true, full_name: true } } },
      orderBy: { created_at: "desc" },
    });
  },

  // 3. ADMIN: Duyệt đơn (approved) hoặc Từ chối đơn (rejected)
  updateRegistrationStatusByAdmin: async (id, body) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");

    const { status, reject_reason } = body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      throw new BadRequestError(
        "Trạng thái chỉ chấp nhận: 'pending', 'approved' hoặc 'rejected'."
      );
    }

    const existingReg = await prisma.course_registrations.findUnique({
      where: { id: regId },
    });
    if (!existingReg) throw new NotFoundError("Không tìm thấy đơn đăng ký.");

    return await prisma.course_registrations.update({
      where: { id: regId },
      data: {
        status,
        ...(reject_reason !== undefined && { reject_reason }),
      },
    });
  },

  // 4. ADMIN: Xóa đơn đăng ký tư vấn
  deleteRegistrationByAdmin: async (id) => {
    const regId = Number(id);
    if (!id || isNaN(regId)) throw new BadRequestError("ID không hợp lệ.");

    const existingReg = await prisma.course_registrations.findUnique({
      where: { id: regId },
    });
    if (!existingReg) throw new NotFoundError("Không tìm thấy đơn đăng ký.");

    await prisma.course_registrations.delete({ where: { id: regId } });
    return true;
  },
};