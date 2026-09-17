import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BookingService } from "../src/services/booking.service";
import {
  BookingModel,
  BookingStatus,
  IBookingRepository,
  ILockService,
} from "../src/interface/bookingInterface";
import { ConflictError, ValidationError } from "@billing/utils";
import { Prisma } from "../src/generated/prisma/client";

describe("BookingService - Availability & Hold Creation", () => {
  const mockBooking: BookingModel = {
    id: "b1000000-0000-0000-0000-000000000001",
    tripId: "t1000000-0000-0000-0000-000000000001",
    seatId: "s1000000-0000-0000-0000-000000000001",
    userId: "u1000000-0000-0000-0000-000000000001",
    fromStopSeq: 1,
    toStopSeq: 3,
    status: BookingStatus.CONFIRMED,
    holdExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockRepo = (
    activeBookings: BookingModel[] = [],
    createFn?: (data: Prisma.BookingCreateInput) => Promise<BookingModel>
  ): IBookingRepository => ({
    findActiveBookingsForSeat: async () => activeBookings,
    createBooking:
      createFn ||
      (async (data) => ({
        id: "b2000000-0000-0000-0000-000000000002",
        tripId: data.tripId,
        seatId: data.seatId,
        userId: data.userId,
        fromStopSeq: data.fromStopSeq,
        toStopSeq: data.toStopSeq,
        status: data.status || BookingStatus.PENDING,
        holdExpiresAt: data.holdExpiresAt
          ? new Date(data.holdExpiresAt as string | Date)
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    findById: async () => null,
  });

  const createMockLockService = (canAcquire = true): ILockService => {
    let locked = !canAcquire;
    return {
      acquireLock: async () => {
        if (locked) return null;
        locked = true;
        return "mock-lock-uuid";
      },
      releaseLock: async () => {
        locked = false;
        return true;
      },
    };
  };

  describe("checkAvailability", () => {
    it("should return true when there are no active bookings for the seat", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      const available = await service.checkAvailability(
        "trip-1",
        "seat-1",
        1,
        4
      );
      assert.strictEqual(available, true);
    });

    it("should return false when a conflicting booking exists", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([mockBooking]), // 1 -> 3 CONFIRMED
        lockService: createMockLockService(),
      });

      // Requested 2 -> 4 overlaps 1 -> 3
      const available = await service.checkAvailability(
        "trip-1",
        "seat-1",
        2,
        4
      );
      assert.strictEqual(available, false);
    });

    it("should return true when existing booking is adjacent and non-overlapping", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([mockBooking]), // 1 -> 3 CONFIRMED
        lockService: createMockLockService(),
      });

      // Requested 3 -> 5 touches at 3 but does not overlap
      const available = await service.checkAvailability(
        "trip-1",
        "seat-1",
        3,
        5
      );
      assert.strictEqual(available, true);
    });

    it("should reject with ValidationError if fromSeq >= toSeq", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.checkAvailability("trip-1", "seat-1", 4, 2);
        },
        ValidationError
      );
    });
  });

  describe("createHold", () => {
    it("should create a PENDING booking with holdExpiresAt ~5 minutes in the future", async () => {
      let createdPayload: Prisma.BookingCreateInput | null = null;

      const service = new BookingService({
        bookingRepository: createMockRepo([], async (data) => {
          createdPayload = data;
          return {
            id: "b2000000-0000-0000-0000-000000000002",
            tripId: data.tripId,
            seatId: data.seatId,
            userId: data.userId,
            fromStopSeq: data.fromStopSeq,
            toStopSeq: data.toStopSeq,
            status: BookingStatus.PENDING,
            holdExpiresAt: data.holdExpiresAt as Date,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }),
        lockService: createMockLockService(),
      });

      const before = Date.now();
      const booking = await service.createHold(
        "trip-1",
        "seat-1",
        "user-1",
        1,
        3
      );
      const after = Date.now();

      assert.strictEqual(booking.status, BookingStatus.PENDING);
      assert.ok(createdPayload);
      assert.ok(booking.holdExpiresAt);

      const expiresMs = booking.holdExpiresAt.getTime();
      const expectedMin = before + 5 * 60 * 1000 - 1000;
      const expectedMax = after + 5 * 60 * 1000 + 1000;

      assert.ok(
        expiresMs >= expectedMin && expiresMs <= expectedMax,
        `holdExpiresAt ${booking.holdExpiresAt.toISOString()} should be ~5 mins from now`
      );
    });

    it("should throw ConflictError if requested seat segment overlaps an existing active booking", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([mockBooking]), // 1 -> 3 CONFIRMED
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.createHold(
            mockBooking.tripId,
            mockBooking.seatId,
            "user-2",
            2,
            4
          );
        },
        ConflictError
      );
    });

    it("should reject with ValidationError if userId is missing", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.createHold("trip-1", "seat-1", "", 1, 3);
        },
        ValidationError
      );
    });

    it("should reject with 409 Conflict when lock cannot be acquired", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(false), // Lock acquisition fails
      });

      await assert.rejects(
        async () => {
          await service.createHold("trip-1", "seat-1", "user-1", 1, 3);
        },
        (err: unknown) => {
          assert.ok(err instanceof ConflictError);
          assert.strictEqual(
            (err as ConflictError).message,
            "This seat is being booked by someone else, please retry."
          );
          return true;
        }
      );
    });

    it("should release the lock even if booking creation throws an error", async () => {
      let lockReleased = false;
      const mockLock: ILockService = {
        acquireLock: async () => "token-1",
        releaseLock: async () => {
          lockReleased = true;
          return true;
        },
      };

      const service = new BookingService({
        bookingRepository: createMockRepo([mockBooking]), // will trigger conflict
        lockService: mockLock,
      });

      await assert.rejects(async () => {
        await service.createHold(mockBooking.tripId, mockBooking.seatId, "user-2", 2, 4);
      });

      assert.strictEqual(lockReleased, true, "Lock should be released in finally block");
    });
  });
});
