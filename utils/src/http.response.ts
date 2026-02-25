import { Response as ExpressResponse } from "express";
import { statusCode } from "./http.statusCodes";

export const AppResponse = {
  success<T>(
    res: ExpressResponse,
    status: number,
    data?: T,
    message?: string
  ) {

    const response = {
      success: true,
      status: status,
      message: message ?? "Request successful",
      data: data ?? null,
    };

    return res.status(status).json(response);
  },

  error(res: ExpressResponse, error: any) {
    const httpStatus =
      error.statusCode && typeof error.statusCode === "number"
        ? error.statusCode
        : statusCode.ERROR;
        
    const response = {
      success: false,
      statusCode: httpStatus,
      message: error.message ?? "Internal server error",
    };

    return res.status(httpStatus).json(response);
  },
};