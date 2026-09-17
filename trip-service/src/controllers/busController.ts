import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode } from "@billing/utils";
import { BusService } from "../services/busService";
import { container } from "../container";

const busService = container.resolve<BusService>("busService");

export const createBus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { registrationNumber, operatorName, busType, totalSeats, seats } = req.body;

    const bus = await busService.createBus({
      registrationNumber,
      operatorName,
      busType,
      totalSeats,
      seats,
    });

    return AppResponse.success(
      res,
      statusCode.CREATED,
      bus,
      "Bus registered with seat layout successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getBusLayout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const bus = await busService.getBusLayout(id);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      bus,
      "Bus layout retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
