import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/dotenv";

const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: 30000,
  });

export const userProxy = createServiceProxy(env.USER_SERVICE_URL);
export const routeProxy = createServiceProxy(env.ROUTE_SERVICE_URL);
export const tripProxy = createServiceProxy(env.TRIP_SERVICE_URL);
export const bookingProxy = createServiceProxy(env.BOOKING_SERVICE_URL);
export const paymentProxy = createServiceProxy(env.PAYMENT_SERVICE_URL);
