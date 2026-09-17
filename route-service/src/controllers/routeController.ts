import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode } from "@billing/utils";
import { RouteService } from "../services/routeService";
import { container } from "../container";

const routeService = container.resolve<RouteService>("routeService");

export const createRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, stops } = req.body;

    const route = await routeService.createRoute({
      name,
      stops,
    });

    return AppResponse.success(
      res,
      statusCode.CREATED,
      route,
      "Route created successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getAllRoutes = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const routes = await routeService.getAllRoutes();

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      routes,
      "Routes retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getRouteStops = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const stops = await routeService.getRouteStops(id);

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      stops,
      "Route stops retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};
