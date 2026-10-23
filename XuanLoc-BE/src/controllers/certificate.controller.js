import { certificateService } from "../services/certificate.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";
import { buildCertificatePdf } from "../common/helpers/pdf.helper.js";

export const certificateController = {
  issueCertificate: async (req, res, next) => {
    try {
      const { enrollment_id } = req.body;
      const certificate = await certificateService.issueCertificateByAdmin(enrollment_id);
      res.status(201).json(responseSuccess(certificate, "Cấp chứng chỉ thành công.", 201));
    } catch (error) {
      next(error);
    }
  },

  downloadCertificate: async (req, res, next) => {
    try {
      const data = await certificateService.downloadCertificate(req.params.id, req.user);
      buildCertificatePdf(res, data);
    } catch (error) {
      next(error);
    }
  },

  verifyCertificate: async (req, res, next) => {
    try {
      const result = await certificateService.verifyCertificateByCode(req.params.code);
      res.status(200).json(responseSuccess(result, "Chứng chỉ hợp lệ."));
    } catch (error) {
      next(error);
    }
  },

  getAllCertificates: async (req, res, next) => {
    try {
      const list = await certificateService.getAllCertificatesByAdmin(req.query);
      res.status(200).json(responseSuccess(list, "Lấy danh sách chứng chỉ thành công."));
    } catch (error) {
      next(error);
    }
  },

  getMyCertificates: async (req, res, next) => {
    try {
      const certificates = await certificateService.getMyCertificates(req.user.id);
      res.status(200).json(responseSuccess(certificates, "Lấy danh sách chứng chỉ của tôi thành công."));
    } catch (error) {
      next(error);
    }
  },
};
