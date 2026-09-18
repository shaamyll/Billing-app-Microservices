import { Payment, PaymentStatus, Prisma } from "../generated/prisma/client";

export type PaymentModel = Payment;
export { PaymentStatus };

export interface ChargeDto {
  bookingId: string;
  userId: string;
  amount: number | string | Prisma.Decimal;
  currency?: string;
  idempotencyKey: string;
}

export interface ChargeResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  failureReason?: string | null;
  payment: PaymentModel;
  isIdempotentReplay?: boolean;
}

export interface IPaymentRepository {
  findByIdempotencyKey(key: string): Promise<PaymentModel | null>;
  createPayment(data: Prisma.PaymentCreateInput): Promise<PaymentModel>;
  findById(id: string): Promise<PaymentModel | null>;
  updateStatus(
    id: string,
    status: PaymentStatus,
    failureReason?: string | null
  ): Promise<PaymentModel>;
}

export interface IPaymentService {
  charge(dto: ChargeDto): Promise<ChargeResult>;
  refund(paymentId: string): Promise<PaymentModel>;
  getPayment(paymentId: string): Promise<PaymentModel>;
}
