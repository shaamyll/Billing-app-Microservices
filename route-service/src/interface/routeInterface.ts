import { Prisma } from "../generated/prisma/client";

export type RouteModel = Prisma.RouteGetPayload<{}>;
export type RouteWithStops = Prisma.RouteGetPayload<{
  include: {
    stops: {
      orderBy: {
        sequenceNumber: "asc";
      };
    };
  };
}>;
export type StopModel = Prisma.StopGetPayload<{}>;
export type CreateRouteInput = Prisma.RouteCreateInput;
export type UpdateRouteInput = Prisma.RouteUpdateInput;
export type RouteWhereInput = Prisma.RouteWhereInput;

export interface CreateRouteDto {
  name: string;
  stops: string[];
}

export interface IRouteRepository {
  create(data: CreateRouteInput): Promise<RouteModel>;
  createRoute(data: CreateRouteInput): Promise<RouteModel>;
  createRouteWithStops(name: string, stopNames: string[]): Promise<RouteWithStops>;
  findById(id: string): Promise<RouteModel | null>;
  findRouteById(id: string): Promise<RouteModel | null>;
  findByName(name: string): Promise<RouteModel | null>;
  findAllRoutes(): Promise<RouteWithStops[]>;
  findStopsByRouteId(routeId: string): Promise<StopModel[]>;
  delete(id: string): Promise<RouteModel>;
}
