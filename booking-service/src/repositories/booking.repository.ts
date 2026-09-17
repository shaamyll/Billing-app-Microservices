import { BaseRepository } from "./base.repository";
import {
  BookingModel,
  BookingStatus,
  IBookingRepository,
} from "../interface/bookingInterface";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/db";
import { PrismaAdapter } from "@billing/utils";

export class BookingRepository
  extends BaseRepository<
    BookingModel,
    Prisma.BookingCreateInput,
    Prisma.BookingUpdateInput,
    Prisma.BookingWhereInput
  >
  implements IBookingRepository
{
  constructor() {
    super(
      new PrismaAdapter<
        BookingModel,
        Prisma.BookingCreateInput,
        Prisma.BookingUpdateInput,
        Prisma.BookingWhereInput
      >(prisma.booking)
    );
  }

  async findActiveBookingsForSeat(
    tripId: string,
    seatId: string
  ): Promise<BookingModel[]> {
    const now = new Date();
    return prisma.booking.findMany({
      where: {
        tripId,
        seatId,
        OR: [
          { status: BookingStatus.CONFIRMED },
          {
            status: BookingStatus.PENDING,
            OR: [
              { holdExpiresAt: null },
              { holdExpiresAt: { gt: now } },
            ],
          },
        ],
      },
    });
  }

  async createBooking(data: Prisma.BookingCreateInput): Promise<BookingModel> {
    return prisma.booking.create({ data });
  }

  override async findById(id: string): Promise<BookingModel | null> {
    return prisma.booking.findUnique({
      where: { id },
    });
  }
}
