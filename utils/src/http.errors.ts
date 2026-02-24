import { CustomError } from "./custom.error";
import { statusCode } from "./http.statusCodes";

export class BadRequestError extends CustomError {
  constructor(message = "Bad Request") {
    super(message, statusCode.BAD_REQUEST);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, statusCode.BAD_REQUEST);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, statusCode.NOT_FOUND);
  }
}


export class ConflictError extends CustomError {
  constructor(message = "Conflict") {
    super(message, statusCode.CONFLICT);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error") {
    super(message, statusCode.ERROR);
  }
}