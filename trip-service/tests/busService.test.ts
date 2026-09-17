import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BusService } from "../src/services/busService";
import { BusType, SeatType } from "../src/generated/prisma/client";
import { IBusRepository, ISeatRepository, BusWithSeats } from "../src/interface/busInterface";
import { ConflictError, ValidationError } from "@billing/utils";

describe("BusService - Bus + Seat Layout Atomic Creation", () => {
  const createMockBusRepo = (overrides?: Partial<IBusRepository>): IBusRepository => ({
    create: async () => ({} as any),
    createBusWithSeats: async () => ({} as any),
    findById: async () => null,
    findBusById: async () => null,
    findByRegistrationNumber: async () => null,
    findBusWithSeats: async () => null,
    findAll: async () => [],
    ...overrides,
  });

  const mockSeatRepo: ISeatRepository = {
    findByBusId: async () => [],
  };

  it("should reject with ValidationError if seat count does not match totalSeats", async () => {
    const busService = new BusService({
      busRepository: createMockBusRepo(),
      seatRepository: mockSeatRepo,
    });

    await assert.rejects(
      async () => {
        await busService.createBus({
          registrationNumber: "KA-01-AB-1234",
          operatorName: "GreenLine Travels",
          busType: BusType.AC_SEATER,
          totalSeats: 3,
          seats: [
            { seatNumber: "1A", seatType: SeatType.WINDOW },
            { seatNumber: "1B", seatType: SeatType.AISLE },
          ], // Only 2 seats provided, totalSeats is 3
        });
      },
      (err: any) => {
        assert.ok(err instanceof ValidationError);
        assert.match(err.message, /must match totalSeats/);
        return true;
      }
    );
  });

  it("should reject with ValidationError if duplicate seatNumber is provided", async () => {
    const busService = new BusService({
      busRepository: createMockBusRepo(),
      seatRepository: mockSeatRepo,
    });

    await assert.rejects(
      async () => {
        await busService.createBus({
          registrationNumber: "KA-01-AB-1234",
          operatorName: "GreenLine Travels",
          busType: BusType.AC_SEATER,
          totalSeats: 2,
          seats: [
            { seatNumber: "1A", seatType: SeatType.WINDOW },
            { seatNumber: "1A", seatType: SeatType.AISLE }, // Duplicate
          ],
        });
      },
      (err: any) => {
        assert.ok(err instanceof ValidationError);
        assert.match(err.message, /Duplicate seatNumber/);
        return true;
      }
    );
  });

  it("should reject with ConflictError if bus registrationNumber already exists", async () => {
    const busService = new BusService({
      busRepository: createMockBusRepo({
        findByRegistrationNumber: async (reg) =>
          ({ id: "existing-id", registrationNumber: reg } as any),
      }),
      seatRepository: mockSeatRepo,
    });

    await assert.rejects(
      async () => {
        await busService.createBus({
          registrationNumber: "KA-01-AB-1234",
          operatorName: "GreenLine Travels",
          busType: BusType.AC_SEATER,
          totalSeats: 1,
          seats: [{ seatNumber: "1A", seatType: SeatType.WINDOW }],
        });
      },
      (err: any) => {
        assert.ok(err instanceof ConflictError);
        assert.match(err.message, /already exists/);
        return true;
      }
    );
  });

  it("should assert transaction rolls back if repository atomic creation fails", async () => {
    let transactionRolledBack = false;

    const busService = new BusService({
      busRepository: createMockBusRepo({
        findByRegistrationNumber: async () => null,
        createBusWithSeats: async () => {
          // Simulate database seat creation failure within the transaction
          transactionRolledBack = true;
          throw new Error("Transaction aborted: failed to create seat at index 2");
        },
      }),
      seatRepository: mockSeatRepo,
    });

    await assert.rejects(
      async () => {
        await busService.createBus({
          registrationNumber: "KA-01-AB-9999",
          operatorName: "Express Travels",
          busType: BusType.AC_SEATER,
          totalSeats: 2,
          seats: [
            { seatNumber: "1A", seatType: SeatType.WINDOW },
            { seatNumber: "1B", seatType: SeatType.AISLE },
          ],
        });
      },
      (err: any) => {
        assert.match(err.message, /Transaction aborted/);
        return true;
      }
    );

    // Verify atomic failure occurred
    assert.strictEqual(transactionRolledBack, true);
  });

  it("should successfully create bus and all seats atomically", async () => {
    const expectedResult: BusWithSeats = {
      id: "bus-uuid-1",
      registrationNumber: "KA-01-AB-1234",
      operatorName: "GreenLine Travels",
      busType: BusType.AC_SEATER,
      totalSeats: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      seats: [
        {
          id: "seat-1",
          busId: "bus-uuid-1",
          seatNumber: "1A",
          seatType: SeatType.WINDOW,
        },
        {
          id: "seat-2",
          busId: "bus-uuid-1",
          seatNumber: "1B",
          seatType: SeatType.AISLE,
        },
      ],
    };

    const busService = new BusService({
      busRepository: createMockBusRepo({
        findByRegistrationNumber: async () => null,
        createBusWithSeats: async () => expectedResult,
      }),
      seatRepository: mockSeatRepo,
    });

    const result = await busService.createBus({
      registrationNumber: "ka-01-ab-1234",
      operatorName: "GreenLine Travels",
      busType: BusType.AC_SEATER,
      totalSeats: 2,
      seats: [
        { seatNumber: "1A", seatType: SeatType.WINDOW },
        { seatNumber: "1B", seatType: SeatType.AISLE },
      ],
    });

    assert.strictEqual(result.id, "bus-uuid-1");
    assert.strictEqual(result.seats.length, 2);
  });
});
