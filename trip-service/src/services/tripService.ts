import { NotFoundError, ValidationError } from "@billing/utils";
import { IBusRepository } from "../interface/busInterface";
import { CreateTripDto, ITripRepository, SearchTripsQuery, TripModel, TripWithBusAndSeats } from "../interface/tripInterface";
import { SeatModel } from "../interface/busInterface";

export class TripService {
  private readonly tripRepository: ITripRepository;
  private readonly busRepository: IBusRepository;

  constructor({
    tripRepository,
    busRepository,
  }: {
    tripRepository: ITripRepository;
    busRepository: IBusRepository;
  }) {
    this.tripRepository = tripRepository;
    this.busRepository = busRepository;
  }

  async createTrip(data: CreateTripDto): Promise<TripModel> {
    const { routeId, busId, departureDate, departureTime, status } = data;

    if (!routeId || typeof routeId !== "string" || routeId.trim().length === 0) {
      throw new ValidationError("routeId is required");
    }

    if (!busId || typeof busId !== "string" || busId.trim().length === 0) {
      throw new ValidationError("busId is required");
    }

    if (!departureDate) {
      throw new ValidationError("departureDate is required");
    }

    if (!departureTime || typeof departureTime !== "string" || departureTime.trim().length === 0) {
      throw new ValidationError("departureTime is required (e.g. '08:30 AM' or '14:00')");
    }

    const dateObj = new Date(departureDate);
    if (isNaN(dateObj.getTime())) {
      throw new ValidationError("Invalid departureDate format");
    }

    // Validate that the referenced bus exists before creating trip
    const bus = await this.busRepository.findBusById(busId.trim());
    if (!bus) {
      throw new NotFoundError(`Bus with ID '${busId.trim()}' not found`);
    }

    return await this.tripRepository.createTrip({
      routeId: routeId.trim(),
      busId: busId.trim(),
      departureDate: dateObj,
      departureTime: departureTime.trim(),
      status,
    });
  }

  async searchTrips(query: SearchTripsQuery): Promise<TripWithBusAndSeats[]> {
    const { routeId, date } = query;

    if (!routeId || typeof routeId !== "string" || routeId.trim().length === 0) {
      throw new ValidationError("routeId is required for searching trips");
    }

    if (!date || typeof date !== "string" || date.trim().length === 0) {
      throw new ValidationError("date query parameter is required (YYYY-MM-DD)");
    }

    const parsedDate = new Date(date.trim());
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationError("Invalid date format. Expected YYYY-MM-DD");
    }

    // Build start of day and end of day in UTC / day boundary
    const dateStr = date.trim().split("T")[0];
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    return await this.tripRepository.findTripsByRouteAndDate(routeId.trim(), startDate, endDate);
  }

  async getTripWithLayout(tripId: string): Promise<TripWithBusAndSeats> {
    if (!tripId || typeof tripId !== "string" || tripId.trim().length === 0) {
      throw new ValidationError("Trip ID is required");
    }

    const trip = await this.tripRepository.findTripWithBusAndSeats(tripId.trim());
    if (!trip) {
      throw new NotFoundError("Trip not found");
    }

    return trip;
  }

  async getTripSeats(tripId: string): Promise<SeatModel[]> {
    const trip = await this.getTripWithLayout(tripId);
    return trip.bus.seats;
  }
}
