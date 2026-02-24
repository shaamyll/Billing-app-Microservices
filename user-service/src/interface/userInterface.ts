import { Prisma } from "../generated/prisma/client";

export type UserModel = Prisma.UserGetPayload<{}>;
export type CreateUserInput = Prisma.UserCreateInput;
export type UpdateUserInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;

export interface IUserRepository {
  create(data: CreateUserInput): Promise<UserModel>;
  findById(id: string): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  findMany(where?: UserWhereInput): Promise<UserModel[]>;
  update(id: string, data: UpdateUserInput): Promise<UserModel>;
  delete(id: string): Promise<UserModel>;
}