import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TripService } from "../src/services/tripService";
import { ITripRepository, TripWithBusAndSeats } from "../src/interface/tripInterface";
import { IBusRepository } from "../interface/busInterface";
import { NotFoundError, ValidationError } from "@billing/utils";
import { BusType, TripStatus } from "../src/generated/prisma/client";

describe("TripService - Trip Scheduling & Search", () => {
  const createMockTripRepo = (overrides?: Partial<ITripRepository>): ITripRepository => ({
    create: async () => ({} as any),
    createTrip: async () => ({} as any),
    findById: async () => null,
    findTripById: async () => null,
    findTripWithBusAndSeats: async () => null,
    findTripsByRouteAndDate: async () => [],
    findAll: async () => [],
    ...overrides,
  });

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

  it("should reject with NotFoundError when scheduling a trip with a non-existent bus", async () => {
    const tripService = new TripService({
      tripRepository: createMockTripRepo(),
      busRepository: createMockBusRepo({
        findBusById: async () => null, // Bus not found
      }),
    });

    await assert.rejects(
      async () => {
        await tripService.createTrip({
          routeId: "route-uuid-1",
          busId: "non-existent-bus-uuid",
          departureDate: "2026-09-25",
          departureTime: "08:30 AM",
        });
      },
      (err: any) => {
        assert.ok(err instanceof NotFoundError);
        assert.match(err.message, /not found/);
        return true;
      }
    );
  });

  it("should successfully schedule a trip when referenced bus exists", async () => {
    let capturedTripData: any = null;

    const tripService = new TripService({
      tripRepository: createMockTripRepo({
        createTrip: async (data) => {
          capturedTripData = data;
          return {
            id: "trip-uuid-1",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        },
      }),
      busRepository: createMockBusRepo({
        findBusById: async (id) =>
          ({
            id,
            registrationNumber: "KA-01-AB-1234",
            operatorName: "GreenLine",
            busType: BusType.AC_SEATER,
            totalSeats: 40,
          } as any),
      }),
    });

    const result = await tripService.createTrip({
      routeId: "route-uuid-1",
      busId: "bus-uuid-1",
      departureDate: "2026-09-25",
      departureTime: "09:00 AM",
    });

    assert.strictEqual(result.id, "trip-uuid-1");
    assert.strictEqual(capturedTripData.routeId, "route-uuid-1");
    assert.strictEqual(capturedTripData.busId, "bus-uuid-1");
    assert.strictEqual(capturedTripData.departureTime, "09:00 AM");
  });

  it("should query trips for full-day boundaries (start of day to end of day)", async () => {
    let queriedStartDate: Date | null = null;
    let queriedEndDate: Date | null = null;
    let queriedRouteId: string | null = null;

    const expectedTrips: TripWithBusAndSeats[] = [
      {
        id: "trip-1",
        routeId: "route-uuid-1",
        busId: "bus-uuid-1",
        departureDate: new Date("2026-09-20T08:00:00.000Z"),
        departureTime: "08:00 AM",
        status: TripStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
        bus: {
          id: "bus-uuid-1",
          registrationNumber: "KA-01-AB-1234",
          operatorName: "GreenLine Travels",
          busType: BusType.AC_SEATER,
          totalSeats: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          seats: [],
        },
      },
    ];

    const tripService = new TripService({
      tripRepository: createMockTripRepo({
        findTripsByRouteAndDate: async (routeId, startDate, endDate) => {
          queriedRouteId = routeId;
          queriedStartDate = startDate;
          queriedEndDate = endDate;
          return expectedTrips;
        },
      }),
      busRepository: createMockBusRepo(),
    });

    const results = await tripService.searchTrips({
      routeId: "route-uuid-1",
      date: "2026-09-20",
    });

    assert.strictEqual(results.length, 1);
    assert.strictEqual(queriedRouteId, "route-uuid-1");
    assert.ok(queriedStartDate instanceof Date);
    assert.ok(queriedEndDate instanceof Date);
    assert.strictEqual(queriedStartDate.toISOString(), "2026-09-20T00:00:00.000Z");
    assert.strictEqual(queriedEndDate.toISOString(), "2026-09-20T23:59:59.999Z");
  });

  it("should reject search query with ValidationError if routeId or date is missing", async () => {
    const tripService = new TripService({
      tripRepository: createMockTripRepo(),
      busRepository: createMockBusRepo(),
    });

    await assert.rejects(
      async () => {
        await tripService.searchTrips({ routeId: "", date: "2026-09-20" });
      },
      (err: any) => {
        assert.ok(err instanceof ValidationError);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await tripService.searchTrips({ routeId: "route-1", date: "invalid-date" });
      },
      (err: any) => {
        assert.ok(err instanceof ValidationError);
        return true;
      }
    );
  });
});
