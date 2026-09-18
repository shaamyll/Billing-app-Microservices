// Original file: proto/booking.proto

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type BookingStatus =
  | 'PENDING'
  | 0
  | 'CONFIRMED'
  | 1
  | 'FAILED'
  | 2
  | 'CANCELLED'
  | 3
  | 'EXPIRED'
  | 4

export type BookingStatus__Output = typeof BookingStatus[keyof typeof BookingStatus]
