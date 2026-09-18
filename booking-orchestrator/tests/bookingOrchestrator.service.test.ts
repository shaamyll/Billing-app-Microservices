import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BookingOrchestratorService } from "../src/services/bookingOrchestrator.service";
import {
  IBookingServiceClient,
  BookingHoldResponse,
} from "../src/clients/bookingServiceClient";
import {
  IPaymentServiceClient,
  ChargeResponse,
  RefundResponse,
} from "../src/clients/paymentServiceClient";
import { IEventPublisher } from "../src/config/kafka";
import { ValidationError } from "@billing/utils";

describe("BookingOrchestratorService - Saga Coordination", () => {
  const mockHold: BookingHoldResponse = {
    id: "booking-uuid-101",
    tripId: "trip-uuid-1",
    seatId: "seat-uuid-1",
    userId: "user-uuid-1",
    fromStopSeq: 1,
    toStopSeq: 3,
    status: "PENDING",
    holdExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createMockPublisher = (): IEventPublisher & {
    events: Array<{ topic: string; eventName: string; payload: Record<string, unknown> }>;
  } => {
    const events: Array<{
      topic: string;
      eventName: string;
      payload: Record<string, unknown>;
    }> = [];
    return {
      events,
      publish: async (topic, eventName, payload) => {
        events.push({ topic, eventName, payload });
      },
      connect: async () => {},
      disconnect: async () => {},
    };
  };

  describe("confirmBooking saga", () => {
    it("should execute full happy path: hold -> charge succeeds -> confirm -> publish BookingConfirmed", async () => {
      let holdCalled = false;
      let confirmCalledWith: string | null = null;
      let chargeCalledWith: Record<string, unknown> | null = null;

      const mockBookingClient: IBookingServiceClient = {
        createHold: async (data) => {
          holdCalled = true;
          return { ...mockHold, ...data };
        },
        confirmBooking: async (bookingId) => {
          confirmCalledWith = bookingId;
          return { ...mockHold, id: bookingId, status: "CONFIRMED" };
        },
        releaseBooking: async () => {
          throw new Error("Should not release on success");
        },
      };

      const mockPaymentClient: IPaymentServiceClient = {
        charge: async (data) => {
          chargeCalledWith = data;
          return {
            success: true,
            paymentId: "pay-uuid-201",
            status: "SUCCEEDED",
            failureReason: null,
          };
        },
        refund: async () => {
          throw new Error("Not implemented");
        },
        getPayment: async () => {
          throw new Error("Not implemented");
        },
      };

      const publisher = createMockPublisher();

      const orchestrator = new BookingOrchestratorService({
        bookingClient: mockBookingClient,
        paymentClient: mockPaymentClient,
        eventPublisher: publisher,
        topic: "test-booking-events",
      });

      const result = await orchestrator.confirmBooking({
        tripId: "trip-uuid-1",
        seatId: "seat-uuid-1",
        userId: "user-uuid-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        amount: 450,
      });

      // 1. Verify hold creation
      assert.strictEqual(holdCalled, true);

      // 2. Verify charge called with deterministic idempotencyKey
      assert.ok(chargeCalledWith);
      assert.strictEqual(chargeCalledWith?.bookingId, "booking-uuid-101");
      assert.strictEqual(chargeCalledWith?.idempotencyKey, "booking-booking-uuid-101");
      assert.strictEqual(chargeCalledWith?.amount, 450);

      // 3. Verify booking confirmed
      assert.strictEqual(confirmCalledWith, "booking-uuid-101");
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.booking?.status, "CONFIRMED");
      assert.strictEqual(result.payment?.status, "SUCCEEDED");

      // 4. Verify Kafka event published
      assert.strictEqual(publisher.events.length, 1);
      const event = publisher.events[0];
      assert.strictEqual(event.topic, "test-booking-events");
      assert.strictEqual(event.eventName, "BookingConfirmed");
      assert.strictEqual(event.payload.bookingId, "booking-uuid-101");
      assert.strictEqual(event.payload.paymentId, "pay-uuid-201");
    });

    it("should execute payment failure path: hold -> charge fails -> release with PAYMENT_FAILED -> publish BookingFailed", async () => {
      let releasedWith: { bookingId: string; reason: string } | null = null;
      let confirmCalled = false;

      const mockBookingClient: IBookingServiceClient = {
        createHold: async (data) => ({ ...mockHold, ...data }),
        confirmBooking: async () => {
          confirmCalled = true;
          throw new Error("Should not confirm on payment failure");
        },
        releaseBooking: async (bookingId, reason) => {
          releasedWith = { bookingId, reason };
          return { ...mockHold, id: bookingId, status: "FAILED" };
        },
      };

      const mockPaymentClient: IPaymentServiceClient = {
        charge: async () => ({
          success: false,
          paymentId: "pay-failed-202",
          status: "FAILED",
          failureReason: "Insufficient funds",
        }),
        refund: async () => {
          throw new Error("Not implemented");
        },
        getPayment: async () => {
          throw new Error("Not implemented");
        },
      };

      const publisher = createMockPublisher();

      const orchestrator = new BookingOrchestratorService({
        bookingClient: mockBookingClient,
        paymentClient: mockPaymentClient,
        eventPublisher: publisher,
      });

      const result = await orchestrator.confirmBooking({
        tripId: "trip-uuid-1",
        seatId: "seat-uuid-1",
        userId: "user-uuid-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        amount: 500,
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.failureReason, "Insufficient funds");
      assert.strictEqual(confirmCalled, false);

      // Verify release called with PAYMENT_FAILED
      assert.ok(releasedWith);
      assert.strictEqual(releasedWith?.bookingId, "booking-uuid-101");
      assert.strictEqual(releasedWith?.reason, "PAYMENT_FAILED");

      // Verify Kafka event published
      assert.strictEqual(publisher.events.length, 1);
      const event = publisher.events[0];
      assert.strictEqual(event.eventName, "BookingFailed");
      assert.strictEqual(event.payload.bookingId, "booking-uuid-101");
      assert.strictEqual(event.payload.failureReason, "Insufficient funds");
    });

    it("should compensate and release hold if payment service throws an unexpected error", async () => {
      let releasedWith: { bookingId: string; reason: string } | null = null;

      const mockBookingClient: IBookingServiceClient = {
        createHold: async (data) => ({ ...mockHold, ...data }),
        confirmBooking: async () => {
          throw new Error("Not reached");
        },
        releaseBooking: async (bookingId, reason) => {
          releasedWith = { bookingId, reason };
          return { ...mockHold, id: bookingId, status: "FAILED" };
        },
      };

      const mockPaymentClient: IPaymentServiceClient = {
        charge: async () => {
          throw new Error("ECONNREFUSED - Payment Service down");
        },
        refund: async () => {
          throw new Error("Not implemented");
        },
        getPayment: async () => {
          throw new Error("Not implemented");
        },
      };

      const publisher = createMockPublisher();

      const orchestrator = new BookingOrchestratorService({
        bookingClient: mockBookingClient,
        paymentClient: mockPaymentClient,
        eventPublisher: publisher,
      });

      await assert.rejects(
        async () => {
          await orchestrator.confirmBooking({
            tripId: "trip-uuid-1",
            seatId: "seat-uuid-1",
            userId: "user-uuid-1",
            fromStopSeq: 1,
            toStopSeq: 3,
            amount: 500,
          });
        },
        /ECONNREFUSED/
      );

      // Verify compensation release was executed
      assert.ok(releasedWith);
      assert.strictEqual(releasedWith?.bookingId, "booking-uuid-101");
      assert.strictEqual(releasedWith?.reason, "PAYMENT_FAILED");
    });

    it("should return immediately if hold creation fails without attempting payment", async () => {
      let paymentAttempted = false;

      const mockBookingClient: IBookingServiceClient = {
        createHold: async () => {
          throw new Error("Seat unavailable (409 Conflict)");
        },
        confirmBooking: async () => {
          throw new Error("Not reached");
        },
        releaseBooking: async () => {
          throw new Error("Not reached");
        },
      };

      const mockPaymentClient: IPaymentServiceClient = {
        charge: async () => {
          paymentAttempted = true;
          throw new Error("Should not charge");
        },
        refund: async () => {
          throw new Error("Not implemented");
        },
        getPayment: async () => {
          throw new Error("Not implemented");
        },
      };

      const publisher = createMockPublisher();

      const orchestrator = new BookingOrchestratorService({
        bookingClient: mockBookingClient,
        paymentClient: mockPaymentClient,
        eventPublisher: publisher,
      });

      await assert.rejects(
        async () => {
          await orchestrator.confirmBooking({
            tripId: "trip-uuid-1",
            seatId: "seat-uuid-1",
            userId: "user-uuid-1",
            fromStopSeq: 1,
            toStopSeq: 3,
            amount: 500,
          });
        },
        /Seat unavailable/
      );

      assert.strictEqual(paymentAttempted, false);
      assert.strictEqual(publisher.events.length, 0);
    });

    it("should reject with ValidationError when required fields are missing", async () => {
      const orchestrator = new BookingOrchestratorService({
        bookingClient: {} as IBookingServiceClient,
        paymentClient: {} as IPaymentServiceClient,
        eventPublisher: createMockPublisher(),
      });

      await assert.rejects(
        async () => {
          await orchestrator.confirmBooking({
            tripId: "",
            seatId: "seat-1",
            userId: "user-1",
            fromStopSeq: 1,
            toStopSeq: 3,
            amount: 100,
          });
        },
        ValidationError
      );
    });
  });

  describe("cancelBooking saga", () => {
    it("should refund payment if paymentId provided, release booking as USER_CANCELLED, and publish event", async () => {
      let refundedPaymentId: string | null = null;
      let releasedBookingId: string | null = null;
      let releaseReason: string | null = null;

      const mockBookingClient: IBookingServiceClient = {
        createHold: async () => {
          throw new Error("Not implemented");
        },
        confirmBooking: async () => {
          throw new Error("Not implemented");
        },
        releaseBooking: async (bookingId, reason) => {
          releasedBookingId = bookingId;
          releaseReason = reason;
          return { ...mockHold, id: bookingId, status: "CANCELLED" };
        },
      };

      const mockPaymentClient: IPaymentServiceClient = {
        charge: async () => {
          throw new Error("Not implemented");
        },
        refund: async (paymentId) => {
          refundedPaymentId = paymentId;
          return {
            id: paymentId,
            bookingId: "b-cancel-1",
            userId: "user-1",
            amount: 450,
            currency: "INR",
            status: "REFUNDED",
          };
        },
        getPayment: async () => {
          throw new Error("Not implemented");
        },
      };

      const publisher = createMockPublisher();

      const orchestrator = new BookingOrchestratorService({
        bookingClient: mockBookingClient,
        paymentClient: mockPaymentClient,
        eventPublisher: publisher,
      });

      const result = await orchestrator.cancelBooking("b-cancel-1", "pay-cancel-1");

      assert.strictEqual(result.success, true);
      assert.strictEqual(refundedPaymentId, "pay-cancel-1");
      assert.strictEqual(releasedBookingId, "b-cancel-1");
      assert.strictEqual(releaseReason, "USER_CANCELLED");

      // Verify Kafka event published
      assert.strictEqual(publisher.events.length, 1);
      const event = publisher.events[0];
      assert.strictEqual(event.eventName, "BookingCancelled");
      assert.strictEqual(event.payload.bookingId, "b-cancel-1");
    });
  });
});
