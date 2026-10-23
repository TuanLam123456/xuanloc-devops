import { statusCodes } from "./status-code.helper.js";

export const responseSuccess = (data, message = "OK", statusCode = 200) => {
  return {
    status: "success",
    statusCode: statusCode,
    message: message,
    data: data,
  };
};

export const responseErr = (
  message = "Internal Server Error",
  statusCode = statusCodes.INTERNAL_SERVER_ERROR,
  stack,
) => {
  return {
    status: "error",
    statusCode: statusCode,
    message: message,
    // stack: nơi hiển thị chi tiết của lỗi, bao gồm đường dẫn đến lỗi, không có trong môi trường production, chỉ hiển thị trong môi trường development
    stack: stack,
  };
};