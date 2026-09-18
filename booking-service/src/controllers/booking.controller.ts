import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode, ValidationError } from "@billing/utils";
import { BookingService } from "../services/booking.service";
import { container } from "../container";

const getBookingService = (): BookingService => {
  return container.resolve<BookingService>("bookingService");
};

export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tripId = Array.isArray(req.params.tripId)
      ? req.params.tripId[0]
      : req.params.tripId;
    const seatId = Array.isArray(req.params.seatId)
      ? req.params.seatId[0]
      : req.params.seatId;

    const fromParam = req.query.from ?? req.query.fromStopSeq;
    const toParam = req.query.to ?? req.query.toStopSeq;

    if (fromParam === undefined || toParam === undefined) {
      throw new ValidationError("Query parameters 'from' and 'to' stop sequences are required");
    }

    const fromSeq = parseInt(String(fromParam), 10);
    const toSeq = parseInt(String(toParam), 10);

    const bookingService = getBookingService();
    const available = await bookingService.checkAvailability(
      tripId,
      seatId,
      fromSeq,
      toSeq
    );

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      { available },
      "Seat availability checked successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const createHold = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tripId, seatId, fromStopSeq, toStopSeq } = req.body;

    // Extract authenticated userId forwarded by Gateway, fallback to body
    const headerUserId = req.headers["x-user-id"];
    const userId = Array.isArray(headerUserId)
      ? headerUserId[0]
      : (headerUserId || req.body.userId);

    if (!userId) {
      throw new ValidationError("User ID is required. Please authenticate via API Gateway.");
    }

    const fromSeq = typeof fromStopSeq === "number" ? fromStopSeq : parseInt(fromStopSeq, 10);
    const toSeq = typeof toStopSeq === "number" ? toStopSeq : parseInt(toStopSeq, 10);

    const bookingService = getBookingService();
    const booking = await bookingService.createHold(
      tripId,
      seatId,
      String(userId),
      fromSeq,
      toSeq
    );

    return AppResponse.success(
      res,
      statusCode.CREATED,
      booking,
      "Booking hold created successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const bookingService = getBookingService();
    const booking = await bookingService.confirmBooking(bookingId);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      booking,
      "Booking confirmed successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const releaseBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { reason } = req.body;

    const bookingService = getBookingService();
    const booking = await bookingService.releaseBooking(bookingId, reason);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      booking,
      "Booking released successfully"
    );
  } catch (error) {
    next(error);
  }
};

