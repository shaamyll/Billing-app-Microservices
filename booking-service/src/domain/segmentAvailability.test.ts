import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasSegmentConflict } from "./segmentAvailability";

// Jest-style assertion adapter using node:assert/strict
const expect = (actual: boolean) => ({
  toBe: (expected: boolean) => {
    assert.strictEqual(
      actual,
      expected,
      `Expected conflict to be ${expected}, but got ${actual}`
    );
  },
});

describe("Segment Availability - hasSegmentConflict", () => {
  it("No existing bookings → no conflict", () => {
    const result = hasSegmentConflict([], 1, 3);
    expect(result).toBe(false);
  });

  it("An existing booking with the exact same segment → conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 4, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 1, 4);
    expect(result).toBe(true);
  });

  it("An existing booking fully containing the requested segment (e.g. existing 1→4, requested 2→3) → conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 4, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 2, 3);
    expect(result).toBe(true);
  });

  it("An existing booking partially overlapping (e.g. existing 1→3, requested 2→4) → conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 3, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 2, 4);
    expect(result).toBe(true);
  });

  it("An existing booking that's adjacent but non-overlapping (e.g. existing 1→3, requested 3→4) → NO conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 3, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 3, 4);
    expect(result).toBe(false);
  });

  it("An existing booking entirely before the requested segment (e.g. existing 1→2, requested 3→4) → NO conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 2, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 3, 4);
    expect(result).toBe(false);
  });

  it("Multiple existing bookings, only one of which overlaps → conflict", () => {
    const existing = [
      { fromSeq: 1, toSeq: 2, status: "CONFIRMED" }, // Before: no overlap
      { fromSeq: 2, toSeq: 4, status: "CONFIRMED" }, // Overlaps with 3→5
      { fromSeq: 5, toSeq: 6, status: "CONFIRMED" }, // Adjacent: no overlap
    ];
    const result = hasSegmentConflict(existing, 3, 5);
    expect(result).toBe(true);
  });

  it("An existing CANCELLED booking that would otherwise overlap → NO conflict (cancelled bookings don't block)", () => {
    const existing = [{ fromSeq: 1, toSeq: 4, status: "CANCELLED" }];
    const result = hasSegmentConflict(existing, 2, 3);
    expect(result).toBe(false);
  });

  it("An existing EXPIRED booking that would otherwise overlap → NO conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 4, status: "EXPIRED" }];
    const result = hasSegmentConflict(existing, 2, 3);
    expect(result).toBe(false);
  });

  it("An existing FAILED booking that would otherwise overlap → NO conflict", () => {
    const existing = [{ fromSeq: 1, toSeq: 4, status: "FAILED" }];
    const result = hasSegmentConflict(existing, 2, 3);
    expect(result).toBe(false);
  });

  it("An existing PENDING booking that overlaps → conflict (pending holds seat)", () => {
    const existing = [{ fromSeq: 1, toSeq: 3, status: "PENDING" }];
    const result = hasSegmentConflict(existing, 2, 4);
    expect(result).toBe(true);
  });

  it("An existing booking entirely after the requested segment (e.g. existing 4→5, requested 1→3) → NO conflict", () => {
    const existing = [{ fromSeq: 4, toSeq: 5, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 1, 3);
    expect(result).toBe(false);
  });

  it("An existing booking that touches start of requested segment (e.g. existing 3→5, requested 1→3) → NO conflict", () => {
    const existing = [{ fromSeq: 3, toSeq: 5, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 1, 3);
    expect(result).toBe(false);
  });

  it("Requested segment fully containing existing booking (e.g. existing 2→3, requested 1→4) → conflict", () => {
    const existing = [{ fromSeq: 2, toSeq: 3, status: "CONFIRMED" }];
    const result = hasSegmentConflict(existing, 1, 4);
    expect(result).toBe(true);
  });
});
