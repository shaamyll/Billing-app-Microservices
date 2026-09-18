import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode, ValidationError } from "@billing/utils";
import { BookingOrchestratorService } from "../services/bookingOrchestrator.service";
import { container } from "../container";

const getOrchestratorService = (): BookingOrchestratorService => {
  return container.resolve<BookingOrchestratorService>("orchestratorService");
};

export const confirmBookingSaga = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tripId, seatId, fromStopSeq, toStopSeq, amount, currency } = req.body;

    const headerUserId = req.headers["x-user-id"];
    const userId = Array.isArray(headerUserId)
      ? headerUserId[0]
      : headerUserId || req.body.userId;

    if (!userId) {
      throw new ValidationError(
        "User ID is required. Please authenticate via API Gateway."
      );
    }

    const fromSeq =
      typeof fromStopSeq === "number" ? fromStopSeq : parseInt(fromStopSeq, 10);
    const toSeq =
      typeof toStopSeq === "number" ? toStopSeq : parseInt(toStopSeq, 10);
    const parsedAmount =
      typeof amount === "number" ? amount : parseFloat(amount);

    const orchestratorService = getOrchestratorService();
    const result = await orchestratorService.confirmBooking({
      tripId,
      seatId,
      userId: String(userId),
      fromStopSeq: fromSeq,
      toStopSeq: toSeq,
      amount: parsedAmount,
      currency,
    });

    if (!result.success) {
      return AppResponse.error(
        res,
        {
          statusCode: statusCode.BAD_REQUEST,
          message: result.failureReason || "Payment declined; booking hold released.",
          data: result,
        }
      );
    }

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      result,
      "Booking confirmed and payment processed successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const cancelBookingSaga = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { paymentId } = req.body || {};

    const orchestratorService = getOrchestratorService();
    const result = await orchestratorService.cancelBooking(
      bookingId,
      paymentId
    );

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      result,
      result.message
    );
  } catch (error) {
    next(error);
  }
};
