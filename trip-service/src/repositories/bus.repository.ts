import { PrismaAdapter } from "@billing/utils";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { IBusRepository, BusWithSeats, CreateBusDto, CreateSeatDto } from "../interface/busInterface";

type TModel = Prisma.BusGetPayload<Prisma.BusFindUniqueArgs>;
type TCreate = Prisma.BusCreateArgs["data"];
type TUpdate = Prisma.BusUpdateArgs["data"];
type TWhere = Prisma.BusWhereInput;

export class BusRepository
  extends BaseRepository<TModel, TCreate, TUpdate, TWhere>
  implements IBusRepository
{
  private readonly prisma: PrismaClient | Prisma.TransactionClient;

  constructor({ prisma }: { prisma: PrismaClient | Prisma.TransactionClient }) {
    super(new PrismaAdapter(prisma.bus));
    this.prisma = prisma;
  }

  async findByRegistrationNumber(registrationNumber: string) {
    return await this.findOne({ registrationNumber });
  }

  async createBus(data: TCreate) {
    return await this.create(data);
  }

  async findBusById(id: string) {
    return await this.findById(id);
  }

  async createBusWithSeats(
    busData: Omit<CreateBusDto, "seats">,
    seats: CreateSeatDto[]
  ): Promise<BusWithSeats> {
    return await this.prisma.bus.create({
      data: {
        registrationNumber: busData.registrationNumber,
        operatorName: busData.operatorName,
        busType: busData.busType,
        totalSeats: busData.totalSeats,
        seats: {
          create: seats.map((seat) => ({
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
          })),
        },
      },
      include: {
        seats: {
          orderBy: {
            seatNumber: "asc",
          },
        },
      },
    });
  }

  async findBusWithSeats(id: string): Promise<BusWithSeats | null> {
    return await this.prisma.bus.findUnique({
      where: { id },
      include: {
        seats: {
          orderBy: {
            seatNumber: "asc",
          },
        },
      },
    });
  }

  async findAll(): Promise<BusWithSeats[]> {
    return await this.prisma.bus.findMany({
      include: {
        seats: {
          orderBy: {
            seatNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
