import { BaseRepository } from "./base.repository";
import {
  PaymentModel,
  PaymentStatus,
  IPaymentRepository,
} from "../interface/paymentInterface";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { PrismaAdapter } from "@billing/utils";

export class PaymentRepository
  extends BaseRepository<
    PaymentModel,
    Prisma.PaymentCreateInput,
    Prisma.PaymentUpdateInput,
    Prisma.PaymentWhereInput
  >
  implements IPaymentRepository
{
  constructor() {
    super(
      new PrismaAdapter<
        PaymentModel,
        Prisma.PaymentCreateInput,
        Prisma.PaymentUpdateInput,
        Prisma.PaymentWhereInput
      >(prisma.payment)
    );
  }

  async findByIdempotencyKey(key: string): Promise<PaymentModel | null> {
    return prisma.payment.findUnique({
      where: { idempotencyKey: key },
    });
  }

  async createPayment(data: Prisma.PaymentCreateInput): Promise<PaymentModel> {
    return prisma.payment.create({ data });
  }

  override async findById(id: string): Promise<PaymentModel | null> {
    return prisma.payment.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
    failureReason?: string | null
  ): Promise<PaymentModel> {
    return prisma.payment.update({
      where: { id },
      data: {
        status,
        failureReason: failureReason !== undefined ? failureReason : undefined,
      },
    });
  }
}
