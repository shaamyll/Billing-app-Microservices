import { ConflictError, NotFoundError, ValidationError } from "@billing/utils";
import { CreateRouteDto, IRouteRepository, RouteWithStops, StopModel } from "../interface/routeInterface";

export class RouteService {
  private readonly routeRepository: IRouteRepository;

  constructor({ routeRepository }: { routeRepository: IRouteRepository }) {
    this.routeRepository = routeRepository;
  }

  async createRoute(data: CreateRouteDto): Promise<RouteWithStops> {
    const { name, stops } = data;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError("Route name is required and must be a non-empty string");
    }

    if (!Array.isArray(stops) || stops.length < 2) {
      throw new ValidationError("A route must have at least 2 stops");
    }

    const trimmedStops = stops.map((stop, idx) => {
      if (!stop || typeof stop !== "string" || stop.trim().length === 0) {
        throw new ValidationError(`Stop at position ${idx + 1} must be a non-empty string`);
      }
      return stop.trim();
    });

    const trimmedName = name.trim();

    const existingRoute = await this.routeRepository.findByName(trimmedName);
    if (existingRoute) {
      throw new ConflictError(`Route with name '${trimmedName}' already exists`);
    }

    return await this.routeRepository.createRouteWithStops(trimmedName, trimmedStops);
  }

  async getAllRoutes(): Promise<RouteWithStops[]> {
    return await this.routeRepository.findAllRoutes();
  }

  async getRouteStops(routeId: string): Promise<StopModel[]> {
    if (!routeId || typeof routeId !== "string" || routeId.trim().length === 0) {
      throw new ValidationError("Route ID is required");
    }

    const route = await this.routeRepository.findRouteById(routeId.trim());
    if (!route) {
      throw new NotFoundError("Route not found");
    }

    return await this.routeRepository.findStopsByRouteId(routeId.trim());
  }
}
