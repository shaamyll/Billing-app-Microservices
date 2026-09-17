import { PrismaAdapter } from "@billing/utils";
import { PrismaClient, Prisma, TripStatus } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { ITripRepository, TripWithBusAndSeats, TripModel } from "../interface/tripInterface";

type TModel = Prisma.TripGetPayload<Prisma.TripFindUniqueArgs>;
type TCreate = Prisma.TripCreateArgs["data"];
type TUpdate = Prisma.TripUpdateArgs["data"];
type TWhere = Prisma.TripWhereInput;

export class TripRepository
  extends BaseRepository<TModel, TCreate, TUpdate, TWhere>
  implements ITripRepository
{
  private readonly prisma: PrismaClient | Prisma.TransactionClient;

  constructor({ prisma }: { prisma: PrismaClient | Prisma.TransactionClient }) {
    super(new PrismaAdapter(prisma.trip));
    this.prisma = prisma;
  }

  async createTrip(data: {
    routeId: string;
    busId: string;
    departureDate: Date;
    departureTime: string;
    status?: TripStatus;
  }): Promise<TripModel> {
    return await this.create({
      routeId: data.routeId,
      departureDate: data.departureDate,
      departureTime: data.departureTime,
      status: data.status ?? TripStatus.SCHEDULED,
      bus: {
        connect: { id: data.busId },
      },
    });
  }

  async findTripById(id: string): Promise<TripModel | null> {
    return await this.findById(id);
  }

  async findTripWithBusAndSeats(id: string): Promise<TripWithBusAndSeats | null> {
    return await this.prisma.trip.findUnique({
      where: { id },
      include: {
        bus: {
          include: {
            seats: {
              orderBy: {
                seatNumber: "asc",
              },
            },
          },
        },
      },
    });
  }

  async findTripsByRouteAndDate(
    routeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TripWithBusAndSeats[]> {
    return await this.prisma.trip.findMany({
      where: {
        routeId,
        departureDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        bus: {
          include: {
            seats: {
              orderBy: {
                seatNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        departureTime: "asc",
      },
    });
  }

  async findAll(): Promise<TripWithBusAndSeats[]> {
    return await this.prisma.trip.findMany({
      include: {
        bus: {
          include: {
            seats: {
              orderBy: {
                seatNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });
  }
}
