import axios, { AxiosInstance } from "axios";
import { env } from "../config/dotenv";

export interface BookingHoldResponse {
  id: string;
  tripId: string;
  seatId: string;
  userId: string;
  fromStopSeq: number;
  toStopSeq: number;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED" | "EXPIRED";
  holdExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBookingServiceClient {
  createHold(data: {
    tripId: string;
    seatId: string;
    userId: string;
    fromStopSeq: number;
    toStopSeq: number;
  }): Promise<BookingHoldResponse>;

  confirmBooking(bookingId: string): Promise<BookingHoldResponse>;

  releaseBooking(
    bookingId: string,
    reason: "PAYMENT_FAILED" | "USER_CANCELLED"
  ): Promise<BookingHoldResponse>;
}

export class BookingServiceClient implements IBookingServiceClient {
  private http: AxiosInstance;

  constructor(baseUrl?: string) {
    this.http = axios.create({
      baseURL: baseUrl || env.BOOKING_SERVICE_URL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async createHold(data: {
    tripId: string;
    seatId: string;
    userId: string;
    fromStopSeq: number;
    toStopSeq: number;
  }): Promise<BookingHoldResponse> {
    const res = await this.http.post("/bookings/hold", data, {
      headers: {
        "x-user-id": data.userId,
      },
    });
    return res.data.data;
  }

  async confirmBooking(bookingId: string): Promise<BookingHoldResponse> {
    const res = await this.http.post(`/bookings/${bookingId}/confirm`);
    return res.data.data;
  }

  async releaseBooking(
    bookingId: string,
    reason: "PAYMENT_FAILED" | "USER_CANCELLED"
  ): Promise<BookingHoldResponse> {
    const res = await this.http.post(`/bookings/${bookingId}/release`, { reason });
    return res.data.data;
  }
}
