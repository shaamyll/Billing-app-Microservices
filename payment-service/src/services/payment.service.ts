import {
  ChargeDto,
  ChargeResult,
  IPaymentRepository,
  IPaymentService,
  PaymentModel,
  PaymentStatus,
} from "../interface/paymentInterface";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@billing/utils";
import { Prisma } from "../generated/prisma/client";
import { env } from "../config/dotenv";

export interface PaymentServiceOptions {
  paymentRepository: IPaymentRepository;
  successRate?: number;
  simulator?: () => boolean;
}

export class PaymentService implements IPaymentService {
  private readonly paymentRepository: IPaymentRepository;
  private readonly successRate: number;
  private readonly simulator?: () => boolean;

  constructor(opts: PaymentServiceOptions) {
    this.paymentRepository = opts.paymentRepository;
    this.successRate =
      opts.successRate !== undefined ? opts.successRate : env.PAYMENT_SUCCESS_RATE;
    this.simulator = opts.simulator;
  }

  private simulateChargeOutcome(): boolean {
    if (this.simulator) {
      return this.simulator();
    }
    // Charges randomly succeed ~90% of the time (or per configured successRate)
    return Math.random() < this.successRate;
  }

  async charge(dto: ChargeDto): Promise<ChargeResult> {
    if (!dto.bookingId || !dto.bookingId.trim()) {
      throw new ValidationError("Booking ID is required");
    }

    if (!dto.userId || !dto.userId.trim()) {
      throw new ValidationError("User ID is required");
    }

    if (dto.amount === undefined || Number(dto.amount) <= 0) {
      throw new ValidationError("Amount must be a positive number");
    }

    if (!dto.idempotencyKey || !dto.idempotencyKey.trim()) {
      throw new ValidationError("Idempotency key is required");
    }

    const trimmedKey = dto.idempotencyKey.trim();

    // 1. Check if a Payment with this exact idempotencyKey already exists
    const existing = await this.paymentRepository.findByIdempotencyKey(trimmedKey);
    if (existing) {
      // Return existing result immediately — do not process a new charge
      return {
        success: existing.status === PaymentStatus.SUCCEEDED,
        paymentId: existing.id,
        status: existing.status,
        failureReason: existing.failureReason,
        payment: existing,
        isIdempotentReplay: true,
      };
    }

    // 2. Simulate the charge (random success/failure per configured rate)
    const isSuccess = this.simulateChargeOutcome();
    const status = isSuccess ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;
    const failureReason = isSuccess
      ? null
      : "Card declined or insufficient funds (simulated)";

    // 3. Persist new Payment row with resulting status
    const created = await this.paymentRepository.createPayment({
      bookingId: dto.bookingId.trim(),
      userId: dto.userId.trim(),
      amount: new Prisma.Decimal(dto.amount.toString()),
      currency: dto.currency?.trim() || "INR",
      status,
      idempotencyKey: trimmedKey,
      failureReason,
    });

    return {
      success: status === PaymentStatus.SUCCEEDED,
      paymentId: created.id,
      status: created.status,
      failureReason: created.failureReason,
      payment: created,
      isIdempotentReplay: false,
    };
  }

  async refund(paymentId: string): Promise<PaymentModel> {
    if (!paymentId || !paymentId.trim()) {
      throw new ValidationError("Payment ID is required");
    }

    const payment = await this.paymentRepository.findById(paymentId.trim());
    if (!payment) {
      throw new NotFoundError(`Payment with ID '${paymentId}' not found`);
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new ConflictError("Payment has already been refunded");
    }

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new ValidationError(
        `Cannot refund a payment that never succeeded (current status: ${payment.status})`
      );
    }

    return this.paymentRepository.updateStatus(
      payment.id,
      PaymentStatus.REFUNDED
    );
  }

  async getPayment(paymentId: string): Promise<PaymentModel> {
    if (!paymentId || !paymentId.trim()) {
      throw new ValidationError("Payment ID is required");
    }

    const payment = await this.paymentRepository.findById(paymentId.trim());
    if (!payment) {
      throw new NotFoundError(`Payment with ID '${paymentId}' not found`);
    }

    return payment;
  }
}
