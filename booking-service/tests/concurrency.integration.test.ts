import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Redis from "ioredis";
import { BookingService } from "../src/services/booking.service";
import { RedisLockService } from "../src/services/lock.service";
import {
  BookingModel,
  BookingStatus,
  IBookingRepository,
} from "../src/interface/bookingInterface";
import { ConflictError } from "@billing/utils";
import { env } from "../src/config/dotenv";
import { Prisma } from "../src/generated/prisma/client";

describe("Concurrency Integration Test - createHold with Redis Distributed Locking", () => {
  let redisClient: Redis;
  let lockService: RedisLockService;

  before(() => {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
    lockService = new RedisLockService({ redisClient });
  });

  after(async () => {
    await redisClient.quit();
  });

  it("should fire two concurrent createHold requests for the same trip+seat+overlapping segment and assert exactly one succeeds and one gets rejected", async () => {
    const tripId = "00000000-0000-0000-0000-000000000001";
    const seatId = "00000000-0000-0000-0000-000000000002";

    // In-memory persistent state for this test run
    const activeBookings: BookingModel[] = [];

    const mockRepo: IBookingRepository = {
      findActiveBookingsForSeat: async () => [...activeBookings],
      createBooking: async (data: Prisma.BookingCreateInput) => {
        // Simulate real database I/O latency (50ms) to ensure the lock window is held
        // when the second concurrent request attempts to acquire it
        await new Promise((resolve) => setTimeout(resolve, 50));

        const newBooking: BookingModel = {
          id: `booking-${Date.now()}-${Math.random()}`,
          tripId: data.tripId,
          seatId: data.seatId,
          userId: data.userId,
          fromStopSeq: data.fromStopSeq,
          toStopSeq: data.toStopSeq,
          status: BookingStatus.PENDING,
          holdExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        activeBookings.push(newBooking);
        return newBooking;
      },
      findById: async () => null,
    };

    const bookingService = new BookingService({
      bookingRepository: mockRepo,
      lockService,
    });

    // Fire two concurrent requests for overlapping segments on the same seat
    // User 1 requests stops 1 -> 3
    // User 2 requests stops 2 -> 4 (overlaps 1 -> 3)
    const [result1, result2] = await Promise.allSettled([
      bookingService.createHold(tripId, seatId, "user-1", 1, 3),
      bookingService.createHold(tripId, seatId, "user-2", 2, 4),
    ]);

    const fulfilled = [result1, result2].filter(
      (r): r is PromiseFulfilledResult<BookingModel> => r.status === "fulfilled"
    );
    const rejected = [result1, result2].filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    // Assertion 1: Exactly one succeeded
    assert.strictEqual(
      fulfilled.length,
      1,
      "Exactly one concurrent hold request should succeed"
    );

    // Assertion 2: Exactly one was rejected
    assert.strictEqual(
      rejected.length,
      1,
      "Exactly one concurrent hold request should be rejected"
    );

    // Assertion 3: The rejection must be a ConflictError (HTTP 409)
    const error = rejected[0].reason;
    assert.ok(
      error instanceof ConflictError,
      `Expected ConflictError but received ${error}`
    );

    // Assertion 4: Verify error message is either the lock collision message or segment overlap conflict
    const expectedMessages = [
      "This seat is being booked by someone else, please retry.",
      `Seat ${seatId} is not available for route segment 2 -> 4`,
    ];
    assert.ok(
      expectedMessages.some((msg) => error.message.includes(msg)),
      `Error message '${error.message}' should be one of expected conflict messages`
    );

    // Assertion 5: Only 1 booking was written to the repository
    assert.strictEqual(
      activeBookings.length,
      1,
      "Only one booking should be written to the database"
    );
  });
});
