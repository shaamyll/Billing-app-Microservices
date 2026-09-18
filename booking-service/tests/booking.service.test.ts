import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BookingService } from "../src/services/booking.service";
import {
  BookingModel,
  BookingStatus,
  IBookingRepository,
  ILockService,
} from "../src/interface/bookingInterface";
import { ConflictError, NotFoundError, ValidationError } from "@billing/utils";
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
    createFn?: (data: Prisma.BookingCreateInput) => Promise<BookingModel>,
    existingBookings: BookingModel[] = []
  ): IBookingRepository => {
    const store = new Map<string, BookingModel>();
    for (const b of activeBookings) store.set(b.id, { ...b });
    for (const b of existingBookings) store.set(b.id, { ...b });

    return {
      findActiveBookingsForSeat: async () => Array.from(store.values()),
      createBooking:
        createFn ||
        (async (data) => {
          const booking: BookingModel = {
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
          };
          store.set(booking.id, booking);
          return booking;
        }),
      findById: async (id: string) => {
        const found = store.get(id);
        return found ? { ...found } : null;
      },
      updateStatus: async (id: string, status: BookingStatus) => {
        const found = store.get(id);
        if (!found) throw new Error("Not found");
        const updated = { ...found, status, updatedAt: new Date() };
        store.set(id, updated);
        return updated;
      },
    };
  };

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

  describe("confirmBooking", () => {
    it("should confirm a valid PENDING booking and transition status to CONFIRMED", async () => {
      const pendingBooking: BookingModel = {
        id: "b-pending-1",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.PENDING,
        holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // future expiry
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = createMockRepo([], undefined, [pendingBooking]);
      const service = new BookingService({
        bookingRepository: repo,
        lockService: createMockLockService(),
      });

      const confirmed = await service.confirmBooking("b-pending-1");

      assert.strictEqual(confirmed.id, "b-pending-1");
      assert.strictEqual(confirmed.status, BookingStatus.CONFIRMED);

      // Verify persisted in repo
      const stored = await repo.findById("b-pending-1");
      assert.strictEqual(stored?.status, BookingStatus.CONFIRMED);
    });

    it("should reject confirming an already-CONFIRMED booking with ConflictError (409)", async () => {
      const confirmedBooking: BookingModel = {
        id: "b-confirmed-1",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.CONFIRMED,
        holdExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const service = new BookingService({
        bookingRepository: createMockRepo([], undefined, [confirmedBooking]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.confirmBooking("b-confirmed-1");
        },
        (err: unknown) => {
          assert.ok(err instanceof ConflictError);
          assert.match((err as ConflictError).message, /Cannot confirm booking with status CONFIRMED/i);
          return true;
        }
      );
    });

    it("should reject confirming an EXPIRED hold with ConflictError (409) and update status to EXPIRED", async () => {
      const expiredBooking: BookingModel = {
        id: "b-expired-1",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.PENDING,
        holdExpiresAt: new Date(Date.now() - 5000), // expired 5 seconds ago
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = createMockRepo([], undefined, [expiredBooking]);
      const service = new BookingService({
        bookingRepository: repo,
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.confirmBooking("b-expired-1");
        },
        (err: unknown) => {
          assert.ok(err instanceof ConflictError);
          assert.match((err as ConflictError).message, /Booking hold has expired/i);
          return true;
        }
      );

      // Verify that status in repository was transitioned to EXPIRED
      const updated = await repo.findById("b-expired-1");
      assert.strictEqual(updated?.status, BookingStatus.EXPIRED);
    });

    it("should throw NotFoundError if booking does not exist", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.confirmBooking("non-existent-id");
        },
        NotFoundError
      );
    });

    it("should throw ValidationError if booking ID is empty", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.confirmBooking("");
        },
        ValidationError
      );
    });
  });

  describe("releaseBooking", () => {
    it("should release with reason PAYMENT_FAILED and transition status to FAILED", async () => {
      const pendingBooking: BookingModel = {
        id: "b-pending-2",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.PENDING,
        holdExpiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = createMockRepo([], undefined, [pendingBooking]);
      const service = new BookingService({
        bookingRepository: repo,
        lockService: createMockLockService(),
      });

      const released = await service.releaseBooking("b-pending-2", "PAYMENT_FAILED");

      assert.strictEqual(released.id, "b-pending-2");
      assert.strictEqual(released.status, BookingStatus.FAILED);

      const stored = await repo.findById("b-pending-2");
      assert.strictEqual(stored?.status, BookingStatus.FAILED);
    });

    it("should release with reason USER_CANCELLED and transition status to CANCELLED", async () => {
      const confirmedBooking: BookingModel = {
        id: "b-confirmed-2",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.CONFIRMED,
        holdExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const repo = createMockRepo([], undefined, [confirmedBooking]);
      const service = new BookingService({
        bookingRepository: repo,
        lockService: createMockLockService(),
      });

      const cancelled = await service.releaseBooking("b-confirmed-2", "USER_CANCELLED");

      assert.strictEqual(cancelled.id, "b-confirmed-2");
      assert.strictEqual(cancelled.status, BookingStatus.CANCELLED);

      const stored = await repo.findById("b-confirmed-2");
      assert.strictEqual(stored?.status, BookingStatus.CANCELLED);
    });

    it("should throw ValidationError if release reason is invalid", async () => {
      const pendingBooking: BookingModel = {
        id: "b-pending-3",
        tripId: "t-1",
        seatId: "s-1",
        userId: "u-1",
        fromStopSeq: 1,
        toStopSeq: 3,
        status: BookingStatus.PENDING,
        holdExpiresAt: new Date(Date.now() + 60000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const service = new BookingService({
        bookingRepository: createMockRepo([], undefined, [pendingBooking]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          // @ts-expect-error testing invalid runtime reason
          await service.releaseBooking("b-pending-3", "INVALID_REASON");
        },
        ValidationError
      );
    });

    it("should throw NotFoundError if booking does not exist on release", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.releaseBooking("missing-booking-id", "PAYMENT_FAILED");
        },
        NotFoundError
      );
    });

    it("should throw ValidationError if booking ID is empty on release", async () => {
      const service = new BookingService({
        bookingRepository: createMockRepo([]),
        lockService: createMockLockService(),
      });

      await assert.rejects(
        async () => {
          await service.releaseBooking("", "PAYMENT_FAILED");
        },
        ValidationError
      );
    });
  });
});

