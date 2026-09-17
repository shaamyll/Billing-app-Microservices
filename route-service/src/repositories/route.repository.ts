import { PrismaAdapter } from "@billing/utils";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { IRouteRepository } from "../interface/routeInterface";

type TModel = Prisma.RouteGetPayload<Prisma.RouteFindUniqueArgs>;
type TCreate = Prisma.RouteCreateArgs["data"];
type TUpdate = Prisma.RouteUpdateArgs["data"];
type TWhere = Prisma.RouteWhereInput;

export class RouteRepository
  extends BaseRepository<TModel, TCreate, TUpdate, TWhere>
  implements IRouteRepository
{
  private readonly prisma: PrismaClient | Prisma.TransactionClient;

  constructor({ prisma }: { prisma: PrismaClient | Prisma.TransactionClient }) {
    super(new PrismaAdapter(prisma.route));
    this.prisma = prisma;
  }

  async findByName(name: string) {
    return await this.findOne({ name });
  }

  async createRoute(data: TCreate) {
    return await this.create(data);
  }

  async findRouteById(id: string) {
    return await this.findById(id);
  }

  async createRouteWithStops(name: string, stopNames: string[]) {
    return await this.prisma.route.create({
      data: {
        name,
        stops: {
          create: stopNames.map((stopName, index) => ({
            name: stopName,
            sequenceNumber: index + 1,
          })),
        },
      },
      include: {
        stops: {
          orderBy: {
            sequenceNumber: "asc",
          },
        },
      },
    });
  }

  async findAllRoutes() {
    return await this.prisma.route.findMany({
      include: {
        stops: {
          orderBy: {
            sequenceNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findStopsByRouteId(routeId: string) {
    return await this.prisma.stop.findMany({
      where: { routeId },
      orderBy: {
        sequenceNumber: "asc",
      },
    });
  }
}
