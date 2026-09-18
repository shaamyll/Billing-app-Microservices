import {
  IBookingServiceClient,
  BookingHoldResponse,
} from "../clients/bookingServiceClient";
import {
  IPaymentServiceClient,
  ChargeResponse,
} from "../clients/paymentServiceClient";
import { IEventPublisher } from "../config/kafka";
import { env } from "../config/dotenv";
import { logger } from "../config/logger";
import { ValidationError } from "@billing/utils";

export interface ConfirmBookingInput {
  tripId: string;
  seatId: string;
  userId: string;
  fromStopSeq: number;
  toStopSeq: number;
  amount: number;
  currency?: string;
}

export interface ConfirmBookingResult {
  success: boolean;
  booking?: BookingHoldResponse;
  payment?: ChargeResponse;
  failureReason?: string | null;
}

export interface CancelBookingResult {
  success: boolean;
  bookingId: string;
  message: string;
}

export class BookingOrchestratorService {
  private bookingClient: IBookingServiceClient;
  private paymentClient: IPaymentServiceClient;
  private eventPublisher: IEventPublisher;
  private topic: string;

  constructor({
    bookingClient,
    paymentClient,
    eventPublisher,
    topic,
  }: {
    bookingClient: IBookingServiceClient;
    paymentClient: IPaymentServiceClient;
    eventPublisher: IEventPublisher;
    topic?: string;
  }) {
    this.bookingClient = bookingClient;
    this.paymentClient = paymentClient;
    this.eventPublisher = eventPublisher;
    this.topic = topic || env.KAFKA_TOPIC_BOOKING_EVENTS;
  }

  async confirmBooking(input: ConfirmBookingInput): Promise<ConfirmBookingResult> {
    const { tripId, seatId, userId, fromStopSeq, toStopSeq, amount, currency } =
      input;

    if (!tripId || !seatId || !userId) {
      throw new ValidationError("tripId, seatId, and userId are required");
    }

    if (
      typeof fromStopSeq !== "number" ||
      typeof toStopSeq !== "number" ||
      fromStopSeq >= toStopSeq
    ) {
      throw new ValidationError(
        "fromStopSeq and toStopSeq must be valid numbers with fromStopSeq < toStopSeq"
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new ValidationError("amount must be a positive number");
    }

    // Step 1: Create Hold in Booking Service
    // If this fails (seat unavailable, 409 conflict, etc.), it throws immediately
    logger.info("Orchestrator: Creating hold", { tripId, seatId, userId });
    const hold = await this.bookingClient.createHold({
      tripId,
      seatId,
      userId,
      fromStopSeq,
      toStopSeq,
    });

    const bookingId = hold.id;
    let holdConfirmed = false;

    try {
      // Step 2: Charge Payment Service with deterministic idempotency key
      const idempotencyKey = `booking-${bookingId}`;
      logger.info("Orchestrator: Charging payment", {
        bookingId,
        idempotencyKey,
        amount,
      });

      const chargeResult = await this.paymentClient.charge({
        bookingId,
        userId,
        amount,
        currency: currency || "INR",
        idempotencyKey,
      });

      // Step 3: Handle payment outcome
      if (chargeResult.status === "SUCCEEDED") {
        // Payment succeeded -> Confirm booking
        logger.info("Orchestrator: Payment succeeded, confirming booking", {
          bookingId,
          paymentId: chargeResult.paymentId,
        });

        const confirmedBooking = await this.bookingClient.confirmBooking(
          bookingId
        );
        holdConfirmed = true;

        // Publish BookingConfirmed event to Kafka
        await this.eventPublisher.publish(this.topic, "BookingConfirmed", {
          bookingId,
          userId,
          tripId,
          seatId,
          amount,
          currency: currency || "INR",
          paymentId: chargeResult.paymentId,
        });

        return {
          success: true,
          booking: confirmedBooking,
          payment: chargeResult,
        };
      } else {
        // Payment failed -> Release booking hold with PAYMENT_FAILED
        logger.warn("Orchestrator: Payment failed, releasing hold", {
          bookingId,
          failureReason: chargeResult.failureReason,
        });

        await this.bookingClient.releaseBooking(bookingId, "PAYMENT_FAILED");

        // Publish BookingFailed event to Kafka
        await this.eventPublisher.publish(this.topic, "BookingFailed", {
          bookingId,
          userId,
          failureReason: chargeResult.failureReason || "Payment declined",
        });

        return {
          success: false,
          failureReason: chargeResult.failureReason || "Payment declined",
          payment: chargeResult,
        };
      }
    } catch (error) {
      // Step 4: Catch-all compensation rollback
      // If an unexpected error occurs after hold succeeded (e.g. payment service unreachable),
      // attempt to release the hold before re-throwing
      if (!holdConfirmed) {
        logger.error(
          "Orchestrator: Unexpected error after hold created. Attempting compensation release.",
          { bookingId, error }
        );
        try {
          await this.bookingClient.releaseBooking(bookingId, "PAYMENT_FAILED");
        } catch (releaseErr) {
          logger.error(
            "Orchestrator: Compensation release failed (scheduler will clean up)",
            { bookingId, releaseErr }
          );
        }
      }
      throw error;
    }
  }

  async cancelBooking(
    bookingId: string,
    paymentId?: string
  ): Promise<CancelBookingResult> {
    if (!bookingId) {
      throw new ValidationError("bookingId is required for cancellation");
    }

    logger.info("Orchestrator: Cancelling booking", { bookingId, paymentId });

    // Step 1: Refund associated payment if paymentId provided
    if (paymentId) {
      try {
        await this.paymentClient.refund(paymentId);
        logger.info("Orchestrator: Refunded payment", { paymentId });
      } catch (err) {
        logger.warn("Orchestrator: Refund warning during cancellation", {
          paymentId,
          err,
        });
      }
    }

    // Step 2: Release booking with USER_CANCELLED
    await this.bookingClient.releaseBooking(bookingId, "USER_CANCELLED");

    // Step 3: Publish BookingCancelled event to Kafka
    await this.eventPublisher.publish(this.topic, "BookingCancelled", {
      bookingId,
      paymentId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      bookingId,
      message: "Booking cancelled and released successfully",
    };
  }
}
