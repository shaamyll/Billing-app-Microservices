import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PaymentService } from "../src/services/payment.service";
import {
  ChargeDto,
  IPaymentRepository,
  PaymentModel,
  PaymentStatus,
} from "../src/interface/paymentInterface";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@billing/utils";
import { Prisma } from "../src/generated/prisma/client";

describe("PaymentService - Idempotency, Charge & Refund", () => {
  const createMockRepo = (initialPayments: PaymentModel[] = []): IPaymentRepository & {
    createCallCount: number;
    createdData: Prisma.PaymentCreateInput[];
    payments: Map<string, PaymentModel>;
  } => {
    const payments = new Map<string, PaymentModel>();
    for (const p of initialPayments) {
      payments.set(p.id, p);
      payments.set(`key:${p.idempotencyKey}`, p);
    }

    let idCounter = 1;
    let createCallCount = 0;
    const createdData: Prisma.PaymentCreateInput[] = [];

    return {
      payments,
      get createCallCount() {
        return createCallCount;
      },
      get createdData() {
        return createdData;
      },
      async findByIdempotencyKey(key: string) {
        return payments.get(`key:${key}`) || null;
      },
      async createPayment(data: Prisma.PaymentCreateInput) {
        createCallCount++;
        createdData.push(data);
        const newPayment: PaymentModel = {
          id: `p0000000-0000-0000-0000-00000000000${idCounter++}`,
          bookingId: data.bookingId,
          userId: data.userId,
          amount: data.amount as Prisma.Decimal,
          currency: data.currency || "INR",
          status: data.status as PaymentStatus,
          idempotencyKey: data.idempotencyKey,
          failureReason: (data.failureReason as string) ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        payments.set(newPayment.id, newPayment);
        payments.set(`key:${newPayment.idempotencyKey}`, newPayment);
        return newPayment;
      },
      async findById(id: string) {
        return payments.get(id) || null;
      },
      async updateStatus(
        id: string,
        status: PaymentStatus,
        failureReason?: string | null
      ) {
        const existing = payments.get(id);
        if (!existing) throw new Error("Payment not found");
        const updated: PaymentModel = {
          ...existing,
          status,
          failureReason:
            failureReason !== undefined ? failureReason : existing.failureReason,
          updatedAt: new Date(),
        };
        payments.set(id, updated);
        payments.set(`key:${updated.idempotencyKey}`, updated);
        return updated;
      },
    };
  };

  describe("charge() - Fresh charge vs Idempotent replay", () => {
    it("should process a new charge with a fresh idempotency key", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => true, // Force successful simulation
      });

      const dto: ChargeDto = {
        bookingId: "b-100",
        userId: "u-200",
        amount: 450.0,
        currency: "INR",
        idempotencyKey: "fresh-key-1",
      };

      const result = await service.charge(dto);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.status, PaymentStatus.SUCCEEDED);
      assert.strictEqual(result.isIdempotentReplay, false);
      assert.strictEqual(mockRepo.createCallCount, 1);
      assert.strictEqual(result.payment.bookingId, "b-100");
      assert.strictEqual(result.payment.userId, "u-200");
      assert.strictEqual(result.payment.idempotencyKey, "fresh-key-1");
      assert.strictEqual(result.failureReason, null);
    });

    it("should return the original result on repeated calls with the same idempotency key without creating a second record", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => true,
      });

      const dto: ChargeDto = {
        bookingId: "b-100",
        userId: "u-200",
        amount: 450.0,
        currency: "INR",
        idempotencyKey: "replay-key-1",
      };

      // First call: fresh charge
      const firstResult = await service.charge(dto);
      assert.strictEqual(firstResult.success, true);
      assert.strictEqual(firstResult.status, PaymentStatus.SUCCEEDED);
      assert.strictEqual(firstResult.isIdempotentReplay, false);
      assert.strictEqual(mockRepo.createCallCount, 1);

      // Second call: exact same idempotency key (simulating network timeout / retry)
      const secondResult = await service.charge(dto);

      assert.strictEqual(secondResult.success, true);
      assert.strictEqual(secondResult.status, PaymentStatus.SUCCEEDED);
      assert.strictEqual(secondResult.isIdempotentReplay, true);
      assert.strictEqual(secondResult.paymentId, firstResult.paymentId);
      // Ensure NO second Payment row was created in DB
      assert.strictEqual(mockRepo.createCallCount, 1);
    });

    it("should correctly persist FAILED status and failureReason when simulated charge fails", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => false, // Force failed simulation
      });

      const dto: ChargeDto = {
        bookingId: "b-100",
        userId: "u-200",
        amount: 450.0,
        currency: "INR",
        idempotencyKey: "failed-key-1",
      };

      const result = await service.charge(dto);

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.status, PaymentStatus.FAILED);
      assert.strictEqual(result.isIdempotentReplay, false);
      assert.strictEqual(mockRepo.createCallCount, 1);
      assert.ok(result.failureReason);
      assert.match(result.failureReason, /declined/i);

      // Verify that replaying a failed charge also idempotently returns the same FAILED result
      const replayResult = await service.charge(dto);
      assert.strictEqual(replayResult.success, false);
      assert.strictEqual(replayResult.status, PaymentStatus.FAILED);
      assert.strictEqual(replayResult.isIdempotentReplay, true);
      assert.strictEqual(mockRepo.createCallCount, 1);
    });

    it("should reject charge with ValidationError when required fields are missing", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
      });

      // Missing bookingId
      await assert.rejects(
        async () => {
          await service.charge({
            bookingId: "",
            userId: "u-1",
            amount: 100,
            idempotencyKey: "k-1",
          });
        },
        ValidationError
      );

      // Missing userId
      await assert.rejects(
        async () => {
          await service.charge({
            bookingId: "b-1",
            userId: "",
            amount: 100,
            idempotencyKey: "k-1",
          });
        },
        ValidationError
      );

      // Non-positive amount
      await assert.rejects(
        async () => {
          await service.charge({
            bookingId: "b-1",
            userId: "u-1",
            amount: 0,
            idempotencyKey: "k-1",
          });
        },
        ValidationError
      );

      // Missing idempotencyKey
      await assert.rejects(
        async () => {
          await service.charge({
            bookingId: "b-1",
            userId: "u-1",
            amount: 100,
            idempotencyKey: "",
          });
        },
        ValidationError
      );
    });
  });

  describe("refund()", () => {
    it("should refund a SUCCEEDED payment and transition status to REFUNDED", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => true,
      });

      const chargeResult = await service.charge({
        bookingId: "b-100",
        userId: "u-200",
        amount: 500.0,
        idempotencyKey: "to-be-refunded",
      });

      const refundResult = await service.refund(chargeResult.paymentId);

      assert.strictEqual(refundResult.status, PaymentStatus.REFUNDED);
      assert.strictEqual(refundResult.id, chargeResult.paymentId);
    });

    it("should reject refund if the payment is already REFUNDED", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => true,
      });

      const chargeResult = await service.charge({
        bookingId: "b-100",
        userId: "u-200",
        amount: 500.0,
        idempotencyKey: "already-refunded-key",
      });

      await service.refund(chargeResult.paymentId);

      // Second refund should fail
      await assert.rejects(
        async () => {
          await service.refund(chargeResult.paymentId);
        },
        ConflictError
      );
    });

    it("should reject refund if the payment never SUCCEEDED (e.g. FAILED)", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => false, // Fails
      });

      const chargeResult = await service.charge({
        bookingId: "b-100",
        userId: "u-200",
        amount: 500.0,
        idempotencyKey: "failed-cannot-refund",
      });

      await assert.rejects(
        async () => {
          await service.refund(chargeResult.paymentId);
        },
        ValidationError
      );
    });

    it("should reject refund if paymentId does not exist", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
      });

      await assert.rejects(
        async () => {
          await service.refund("non-existent-id");
        },
        NotFoundError
      );
    });
  });

  describe("getPayment()", () => {
    it("should retrieve an existing payment", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
        simulator: () => true,
      });

      const chargeResult = await service.charge({
        bookingId: "b-999",
        userId: "u-999",
        amount: 300.0,
        idempotencyKey: "get-key-1",
      });

      const fetched = await service.getPayment(chargeResult.paymentId);
      assert.strictEqual(fetched.id, chargeResult.paymentId);
      assert.strictEqual(fetched.bookingId, "b-999");
    });

    it("should throw NotFoundError for non-existent payment ID", async () => {
      const mockRepo = createMockRepo();
      const service = new PaymentService({
        paymentRepository: mockRepo,
      });

      await assert.rejects(
        async () => {
          await service.getPayment("invalid-id");
        },
        NotFoundError
      );
    });
  });
});
