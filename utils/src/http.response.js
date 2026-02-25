"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponse = void 0;
const http_statusCodes_1 = require("./http.statusCodes");
exports.AppResponse = {
    success(res, status, data, message) {
        const response = {
            success: true,
            status: status,
            message: message ?? "Request successful",
            data: data ?? null,
        };
        return res.status(status).json(response);
    },
    error(res, error) {
        const httpStatus = error.statusCode && typeof error.statusCode === "number"
            ? error.statusCode
            : http_statusCodes_1.statusCode.ERROR;
        const response = {
            success: false,
            statusCode: httpStatus,
            message: error.message ?? "Internal server error",
        };
        return res.status(httpStatus).json(response);
    },
};
