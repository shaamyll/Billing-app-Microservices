import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode, ValidationError } from "@billing/utils";
import { PaymentService } from "../services/payment.service";
import { container } from "../container";

const getPaymentService = (): PaymentService => {
  return container.resolve<PaymentService>("paymentService");
};

export const processCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawIdempotencyKey =
      req.headers["idempotency-key"] || req.headers["x-idempotency-key"];

    const idempotencyKey = Array.isArray(rawIdempotencyKey)
      ? rawIdempotencyKey[0]
      : rawIdempotencyKey;

    if (!idempotencyKey || !idempotencyKey.trim()) {
      throw new ValidationError(
        "Idempotency-Key header is required for processing a charge"
      );
    }

    // Extract authenticated userId forwarded by Gateway, fallback to request body
    const headerUserId = req.headers["x-user-id"];
    const userId = Array.isArray(headerUserId)
      ? headerUserId[0]
      : (headerUserId || req.body.userId);

    if (!userId || !String(userId).trim()) {
      throw new ValidationError(
        "User ID is required. Please authenticate via API Gateway."
      );
    }

    const { bookingId, amount, currency } = req.body;

    if (!bookingId || !String(bookingId).trim()) {
      throw new ValidationError("Booking ID is required");
    }

    if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ValidationError("Amount must be a positive number");
    }

    const paymentService = getPaymentService();
    const result = await paymentService.charge({
      bookingId: String(bookingId),
      userId: String(userId),
      amount: Number(amount),
      currency: currency ? String(currency) : undefined,
      idempotencyKey: String(idempotencyKey),
    });

    const httpStatus = result.isIdempotentReplay
      ? statusCode.SUCCESS
      : statusCode.CREATED;

    const message = result.isIdempotentReplay
      ? "Existing payment retrieved (idempotent replay)"
      : result.success
      ? "Payment processed successfully"
      : "Payment failed during processing";

    return AppResponse.success(res, httpStatus, result, message);
  } catch (error) {
    next(error);
  }
};

export const processRefund = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const paymentId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!paymentId || !paymentId.trim()) {
      throw new ValidationError("Payment ID is required");
    }

    const paymentService = getPaymentService();
    const refundedPayment = await paymentService.refund(paymentId.trim());

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      refundedPayment,
      "Payment refunded successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const paymentId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!paymentId || !paymentId.trim()) {
      throw new ValidationError("Payment ID is required");
    }

    const paymentService = getPaymentService();
    const payment = await paymentService.getPayment(paymentId.trim());

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      payment,
      "Payment retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};
