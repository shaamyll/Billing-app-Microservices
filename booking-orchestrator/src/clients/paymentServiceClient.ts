import axios, { AxiosInstance } from "axios";
import { env } from "../config/dotenv";

export interface ChargeResponse {
  success: boolean;
  paymentId: string;
  status: "SUCCEEDED" | "FAILED" | "REFUNDED";
  failureReason?: string | null;
  isIdempotentReplay?: boolean;
  payment?: {
    id: string;
    bookingId: string;
    userId: string;
    amount: string | number;
    currency: string;
    status: string;
    idempotencyKey: string;
    failureReason?: string | null;
  };
}

export interface RefundResponse {
  id: string;
  bookingId: string;
  userId: string;
  amount: string | number;
  currency: string;
  status: "REFUNDED";
}

export interface IPaymentServiceClient {
  charge(data: {
    bookingId: string;
    userId: string;
    amount: number;
    currency?: string;
    idempotencyKey: string;
  }): Promise<ChargeResponse>;

  refund(paymentId: string): Promise<RefundResponse>;

  getPayment(paymentId: string): Promise<ChargeResponse>;
}

export class PaymentServiceClient implements IPaymentServiceClient {
  private http: AxiosInstance;

  constructor(baseUrl?: string) {
    this.http = axios.create({
      baseURL: baseUrl || env.PAYMENT_SERVICE_URL,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async charge(data: {
    bookingId: string;
    userId: string;
    amount: number;
    currency?: string;
    idempotencyKey: string;
  }): Promise<ChargeResponse> {
    const res = await this.http.post(
      "/payments/charge",
      {
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency || "INR",
      },
      {
        headers: {
          "Idempotency-Key": data.idempotencyKey,
          "x-user-id": data.userId,
        },
      }
    );
    return res.data.data;
  }

  async refund(paymentId: string): Promise<RefundResponse> {
    const res = await this.http.post(`/payments/${paymentId}/refund`);
    return res.data.data;
  }

  async getPayment(paymentId: string): Promise<ChargeResponse> {
    const res = await this.http.get(`/payments/${paymentId}`);
    return res.data.data;
  }
}
