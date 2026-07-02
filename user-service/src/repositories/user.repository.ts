import { PrismaAdapter } from "@billing/utils";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { BaseRepository } from "./base.respository";

type TModel = Prisma.UserGetPayload<Prisma.UserFindUniqueArgs>;
type TCreate = Prisma.UserCreateArgs["data"];
type TUpdate = Prisma.UserUpdateArgs["data"];
type TWhere = Prisma.UserWhereInput;

export class UserRepository extends BaseRepository<TModel, TCreate, TUpdate, TWhere> {
  constructor({ prisma }: { prisma: PrismaClient | Prisma.TransactionClient }) {
    super(new PrismaAdapter(prisma.user));
  }

  async findUserByEmail(email: string) {
    return await this.findOne({ email });
  }

  async createUser(data: TCreate) {
    return await this.create(data);
  }

  async findUserById(id: string) {
    return await this.findById(id);
  }
}
