import { PrismaAdapter } from "@billing/utils";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { ISeatRepository, SeatModel } from "../interface/busInterface";

type TModel = Prisma.SeatGetPayload<Prisma.SeatFindUniqueArgs>;
type TCreate = Prisma.SeatCreateArgs["data"];
type TUpdate = Prisma.SeatUpdateArgs["data"];
type TWhere = Prisma.SeatWhereInput;

export class SeatRepository
  extends BaseRepository<TModel, TCreate, TUpdate, TWhere>
  implements ISeatRepository
{
  private readonly prisma: PrismaClient | Prisma.TransactionClient;

  constructor({ prisma }: { prisma: PrismaClient | Prisma.TransactionClient }) {
    super(new PrismaAdapter(prisma.seat));
    this.prisma = prisma;
  }

  async findByBusId(busId: string): Promise<SeatModel[]> {
    return await this.prisma.seat.findMany({
      where: { busId },
      orderBy: {
        seatNumber: "asc",
      },
    });
  }
}
