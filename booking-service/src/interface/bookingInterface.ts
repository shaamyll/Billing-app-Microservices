import { Booking, BookingStatus, Prisma } from "../generated/prisma/client";

export type BookingModel = Booking;
export { BookingStatus };

export interface CreateHoldDto {
  tripId: string;
  seatId: string;
  userId: string;
  fromStopSeq: number;
  toStopSeq: number;
}

export interface IBookingRepository {
  findActiveBookingsForSeat(tripId: string, seatId: string): Promise<BookingModel[]>;
  createBooking(data: Prisma.BookingCreateInput): Promise<BookingModel>;
  findById(id: string): Promise<BookingModel | null>;
}

export interface ILockService {
  acquireLock(key: string, ttlMs: number): Promise<string | null>;
  releaseLock(key: string, lockValue: string): Promise<boolean>;
}

export interface IBookingService {
  checkAvailability(
    tripId: string,
    seatId: string,
    fromSeq: number,
    toSeq: number
  ): Promise<boolean>;
  createHold(
    tripId: string,
    seatId: string,
    userId: string,
    fromSeq: number,
    toSeq: number
  ): Promise<BookingModel>;
}
