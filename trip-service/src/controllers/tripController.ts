import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode } from "@billing/utils";
import { TripService } from "../services/tripService";
import { container } from "../container";

const tripService = container.resolve<TripService>("tripService");

export const createTrip = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { routeId, busId, departureDate, departureTime, status } = req.body;

    const trip = await tripService.createTrip({
      routeId,
      busId,
      departureDate,
      departureTime,
      status,
    });

    return AppResponse.success(
      res,
      statusCode.CREATED,
      trip,
      "Trip scheduled successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const searchTrips = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const routeId = typeof req.query.routeId === "string" ? req.query.routeId : "";
    const date = typeof req.query.date === "string" ? req.query.date : "";

    const trips = await tripService.searchTrips({ routeId, date });

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      trips,
      "Trips retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getTripWithLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const trip = await tripService.getTripWithLayout(id);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      trip,
      "Trip details with seat layout retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getTripSeats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const seats = await tripService.getTripSeats(id);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      seats,
      "Trip seat layout retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
