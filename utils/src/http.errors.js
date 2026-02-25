"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ValidationError = exports.BadRequestError = void 0;
const custom_error_1 = require("./custom.error");
const http_statusCodes_1 = require("./http.statusCodes");
class BadRequestError extends custom_error_1.CustomError {
    constructor(message = "Bad Request") {
        super(message, http_statusCodes_1.statusCode.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends custom_error_1.CustomError {
    constructor(message) {
        super(message, http_statusCodes_1.statusCode.BAD_REQUEST);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends custom_error_1.CustomError {
    constructor(message) {
        super(message, http_statusCodes_1.statusCode.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends custom_error_1.CustomError {
    constructor(message = "Conflict") {
        super(message, http_statusCodes_1.statusCode.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends custom_error_1.CustomError {
    constructor(message = "Internal Server Error") {
        super(message, http_statusCodes_1.statusCode.ERROR);
    }
}
exports.InternalServerError = InternalServerError;
