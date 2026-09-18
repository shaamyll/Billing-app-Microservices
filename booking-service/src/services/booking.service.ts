import {
  BookingModel,
  BookingStatus,
  IBookingRepository,
  IBookingService,
  ILockService,
  ReleaseReason,
} from "../interface/bookingInterface";
import { hasSegmentConflict } from "../domain/segmentAvailability";
import { ConflictError, NotFoundError, ValidationError } from "@billing/utils";
import { env } from "../config/dotenv";

export class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;
  private lockService: ILockService;

  constructor({
    bookingRepository,
    lockService,
  }: {
    bookingRepository: IBookingRepository;
    lockService: ILockService;
  }) {
    this.bookingRepository = bookingRepository;
    this.lockService = lockService;
  }

  async checkAvailability(
    tripId: string,
    seatId: string,
    fromSeq: number,
    toSeq: number
  ): Promise<boolean> {
    if (!tripId || !seatId) {
      throw new ValidationError("tripId and seatId are required");
    }

    if (
      typeof fromSeq !== "number" ||
      typeof toSeq !== "number" ||
      Number.isNaN(fromSeq) ||
      Number.isNaN(toSeq)
    ) {
      throw new ValidationError("fromStopSeq and toStopSeq must be valid numbers");
    }

    if (fromSeq >= toSeq) {
      throw new ValidationError(
        `fromStopSeq (${fromSeq}) must be strictly less than toStopSeq (${toSeq})`
      );
    }

    const activeBookings =
      await this.bookingRepository.findActiveBookingsForSeat(tripId, seatId);

    const segmentBookings = activeBookings.map((b) => ({
      fromSeq: b.fromStopSeq,
      toSeq: b.toStopSeq,
      status: b.status,
    }));

    const conflict = hasSegmentConflict(segmentBookings, fromSeq, toSeq);
    return !conflict;
  }

  async createHold(
    tripId: string,
    seatId: string,
    userId: string,
    fromSeq: number,
    toSeq: number
  ): Promise<BookingModel> {
    if (!userId) {
      throw new ValidationError("userId is required to create a booking hold");
    }

    const lockKey = `lock:trip:${tripId}:seat:${seatId}`;
    const lockTtlMs = env.LOCK_TTL_MS || 5000;

    // 1. Attempt to acquire distributed lock
    const lockValue = await this.lockService.acquireLock(lockKey, lockTtlMs);
    if (!lockValue) {
      throw new ConflictError(
        "This seat is being booked by someone else, please retry."
      );
    }

    try {
      // 2. Check availability inside the lock
      const isAvailable = await this.checkAvailability(
        tripId,
        seatId,
        fromSeq,
        toSeq
      );

      if (!isAvailable) {
        throw new ConflictError(
          `Seat ${seatId} is not available for route segment ${fromSeq} -> ${toSeq}`
        );
      }

      // 3. Create PENDING hold
      const holdDurationMs = (env.HOLD_DURATION_MINUTES || 5) * 60 * 1000;
      const holdExpiresAt = new Date(Date.now() + holdDurationMs);

      return await this.bookingRepository.createBooking({
        tripId,
        seatId,
        userId,
        fromStopSeq: fromSeq,
        toStopSeq: toSeq,
        status: BookingStatus.PENDING,
        holdExpiresAt,
      });
    } finally {
      // 4. Always release lock using check-and-delete
      await this.lockService.releaseLock(lockKey, lockValue);
    }
  }

  async confirmBooking(id: string): Promise<BookingModel> {
    if (!id) {
      throw new ValidationError("Booking ID is required");
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictError(
        `Cannot confirm booking with status ${booking.status}. Only PENDING bookings can be confirmed.`
      );
    }

    if (booking.holdExpiresAt && booking.holdExpiresAt.getTime() < Date.now()) {
      await this.bookingRepository.updateStatus(id, BookingStatus.EXPIRED);
      throw new ConflictError(
        "Booking hold has expired. The hold is no longer valid."
      );
    }

    return await this.bookingRepository.updateStatus(id, BookingStatus.CONFIRMED);
  }

  async releaseBooking(id: string, reason: ReleaseReason): Promise<BookingModel> {
    if (!id) {
      throw new ValidationError("Booking ID is required");
    }

    if (reason !== "PAYMENT_FAILED" && reason !== "USER_CANCELLED") {
      throw new ValidationError(
        "Invalid release reason. Must be 'PAYMENT_FAILED' or 'USER_CANCELLED'"
      );
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    const targetStatus =
      reason === "PAYMENT_FAILED"
        ? BookingStatus.FAILED
        : BookingStatus.CANCELLED;

    return await this.bookingRepository.updateStatus(id, targetStatus);
  }
}

