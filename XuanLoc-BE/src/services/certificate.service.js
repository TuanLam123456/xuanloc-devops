import { prisma } from "../common/prisma/connect.prisma.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../common/helpers/exception.helper.js";
import {
  getPagination,
  buildPaginatedResult,
} from "../common/helpers/pagination.helper.js";

const generateCertificateCode = (enrollmentId) => {
  const year = new Date().getFullYear();
  return `XL-${year}-${String(enrollmentId).padStart(6, "0")}`;
};

export const certificateService = {
  // Admin: cấp chứng chỉ cho 1 enrollment đã hoàn thành
  issueCertificateByAdmin: async (enrollmentId) => {
    const eId = Number(enrollmentId);
    if (!eId || isNaN(eId)) throw new BadRequestError("ID ghi danh không hợp lệ.");

    const enrollment = await prisma.enrollments.findUnique({
      where: { id: eId },
      include: { certificates: true },
    });
    if (!enrollment || enrollment.deleted_at) {
      throw new NotFoundError("Không tìm thấy thông tin ghi danh.");
    }
    if (enrollment.status !== "completed") {
      throw new BadRequestError("Chỉ cấp chứng chỉ cho ghi danh đã hoàn thành (status = completed).");
    }
    if (enrollment.certificates) {
      throw new BadRequestError("Ghi danh này đã được cấp chứng chỉ rồi.");
    }

    return await prisma.certificates.create({
      data: {
        enrollment_id: eId,
        certificate_code: generateCertificateCode(eId),
      },
    });
  },

  // Tải PDF chứng chỉ (chủ sở hữu hoặc admin/teacher)
  downloadCertificate: async (certificateId, requestingUser) => {
    const certId = Number(certificateId);
    if (!certId || isNaN(certId)) throw new BadRequestError("ID chứng chỉ không hợp lệ.");

    const certificate = await prisma.certificates.findUnique({
      where: { id: certId },
      include: {
        enrollments: {
          include: {
            users: { select: { id: true, full_name: true } },
            classes: { include: { courses: { select: { title: true } } } },
          },
        },
      },
    });
    if (!certificate) throw new NotFoundError("Không tìm thấy chứng chỉ.");

    const isOwner = certificate.enrollments.student_id === requestingUser?.id;
    const isStaff = ["admin", "teacher"].includes(requestingUser?.role);
    if (!isOwner && !isStaff) {
      throw new ForbiddenError("Bạn không có quyền tải chứng chỉ này.");
    }

    return {
      studentName: certificate.enrollments.users.full_name,
      courseTitle: certificate.enrollments.classes.courses.title,
      certificateCode: certificate.certificate_code,
      issuedAt: certificate.issued_at,
    };
  },

  // Public: xác minh chứng chỉ qua mã
  verifyCertificateByCode: async (code) => {
    if (!code) throw new BadRequestError("Vui lòng cung cấp mã chứng chỉ.");

    const certificate = await prisma.certificates.findUnique({
      where: { certificate_code: code },
      include: {
        enrollments: {
          include: {
            users: { select: { full_name: true } },
            classes: { include: { courses: { select: { title: true } } } },
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundError("Mã chứng chỉ không tồn tại hoặc không hợp lệ.");
    }

    return {
      certificate_code: certificate.certificate_code,
      student_name: certificate.enrollments.users.full_name,
      course_title: certificate.enrollments.classes.courses.title,
      issued_at: certificate.issued_at,
    };
  },

  // Học viên: xem danh sách chứng chỉ của chính mình
  getMyCertificates: async (studentId) => {
    return await prisma.certificates.findMany({
      where: { enrollments: { student_id: studentId } },
      include: {
        enrollments: {
          include: {
            classes: { include: { courses: { select: { title: true } } } },
          },
        },
      },
      orderBy: { issued_at: "desc" },
    });
  },

  getAllCertificatesByAdmin: async (query) => {
    const { page, pageSize, skip, take } = getPagination(query);

    const [certificates, total] = await Promise.all([
      prisma.certificates.findMany({
        include: {
          enrollments: {
            include: {
              users: { select: { id: true, full_name: true } },
              classes: { include: { courses: { select: { title: true } } } },
            },
          },
        },
        orderBy: { issued_at: "desc" },
        skip,
        take,
      }),
      prisma.certificates.count(),
    ]);

    return buildPaginatedResult(certificates, total, page, pageSize);
  },
};
