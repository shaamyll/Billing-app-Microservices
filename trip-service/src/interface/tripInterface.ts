import { Trip, TripStatus, Prisma } from "../generated/prisma/client";
import { BusWithSeats, SeatModel } from "./busInterface";

export type TripModel = Trip;

export type TripWithBusAndSeats = Prisma.TripGetPayload<{
  include: {
    bus: {
      include: {
        seats: {
          orderBy: {
            seatNumber: "asc";
          };
        };
      };
    };
  };
}>;

export interface CreateTripDto {
  routeId: string;
  busId: string;
  departureDate: string | Date;
  departureTime: string;
  status?: TripStatus;
}

export interface SearchTripsQuery {
  routeId: string;
  date: string;
}

export interface ITripRepository {
  create(data: Prisma.TripCreateInput): Promise<TripModel>;
  createTrip(data: {
    routeId: string;
    busId: string;
    departureDate: Date;
    departureTime: string;
    status?: TripStatus;
  }): Promise<TripModel>;
  findById(id: string): Promise<TripModel | null>;
  findTripById(id: string): Promise<TripModel | null>;
  findTripWithBusAndSeats(id: string): Promise<TripWithBusAndSeats | null>;
  findTripsByRouteAndDate(routeId: string, startDate: Date, endDate: Date): Promise<TripWithBusAndSeats[]>;
  findAll(): Promise<TripWithBusAndSeats[]>;
}
