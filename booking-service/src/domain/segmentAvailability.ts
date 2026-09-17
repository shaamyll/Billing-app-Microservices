export interface ExistingBookingSegment {
  fromSeq: number;
  toSeq: number;
  status: string;
}

/**
 * Determines whether a requested segment [requestedFromSeq, requestedToSeq]
 * conflicts with any active bookings on the same seat.
 *
 * Conflict Rule:
 * Two segments overlap if and only if:
 * existing.fromSeq < requested.toSeq AND requested.fromSeq < existing.toSeq
 *
 * Non-overlapping adjacent segments (e.g., 1->3 and 3->4) share a boundary stop
 * but do not overlap in transit, so they do NOT conflict.
 *
 * Only bookings with status 'CONFIRMED' or 'PENDING' are blocking.
 * 'CANCELLED', 'FAILED', 'EXPIRED', or any other non-blocking statuses are ignored.
 */
export function hasSegmentConflict(
  existingBookings: { fromSeq: number; toSeq: number; status: string }[],
  requestedFromSeq: number,
  requestedToSeq: number
): boolean {
  const BLOCKING_STATUSES = new Set(["CONFIRMED", "PENDING"]);

  for (const booking of existingBookings) {
    if (!BLOCKING_STATUSES.has(booking.status.toUpperCase())) {
      continue;
    }

    if (booking.fromSeq < requestedToSeq && requestedFromSeq < booking.toSeq) {
      return true;
    }
  }

  return false;
}
