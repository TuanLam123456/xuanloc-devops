import {
  BANK_BIN,
  BANK_ACCOUNT_NO,
  BANK_ACCOUNT_NAME,
} from "../constant/app.constant.js";

// Sinh URL ảnh mã VietQR (dịch vụ công khai img.vietqr.io, không cần API key).
// Học viên quét mã bằng app ngân hàng bất kỳ để chuyển khoản trực tiếp vào tài khoản của trung tâm.
export const buildVietQrUrl = ({ amount, addInfo }) => {
  if (!BANK_BIN || !BANK_ACCOUNT_NO) {
    return null;
  }

  const params = new URLSearchParams();
  if (amount) params.set("amount", String(Math.round(Number(amount))));
  if (addInfo) params.set("addInfo", addInfo);
  if (BANK_ACCOUNT_NAME) params.set("accountName", BANK_ACCOUNT_NAME);

  return `https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT_NO}-compact2.png?${params.toString()}`;
};
