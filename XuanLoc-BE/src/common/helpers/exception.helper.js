import { statusCodes } from "./status-code.helper.js";

// Bad request (400)
export class BadRequestError extends Error {
  statusCode = statusCodes.BAD_REQUEST;
  name = "BadRequestError";
  constructor(message = "Bad Requset Error") {
    super(message);
  }
}

//Unauthorized (401)
export class UnauthorizedError extends Error {
  statusCode = statusCodes.UNAUTHORIZED;
  name = "UnauthorizedError";
  constructor(message = "Unauthorized Error") {
    super(message);
  }
}

//Forbidden (403)
export class ForbiddenError extends Error {
  statusCode = statusCodes.FORBIDDEN;
  name = "ForbiddenError";
  constructor(message = "Forbidden Error") {
    super(message);
  }
}

//Not Found (404)
export class NotFoundError extends Error {
  statusCode = statusCodes.NOT_FOUND;
  name = "NotFoundError";
  constructor(message = "Not Found Error") {
    super(message);
  }
}

//Internal Server Error (500)
export class InternalServerError extends Error {
  statusCode = statusCodes.INTERNAL_SERVER_ERROR;
  name = "InternalServerError";
  constructor(message = "Internal Server Error") {
    super(message);
  }
}