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

export const productProxy = createServiceProxy(env.PRODUCT_SERVICE_URL);

export const customerProxy = createServiceProxy(env.CUSTOMER_SERVICE_URL);

export const invoiceProxy = createServiceProxy(env.INVOICE_SERVICE_URL);

export const storeProxy = createServiceProxy(env.STORE_SERVICE_URL);

export const notificationProxy = createServiceProxy(
  env.NOTIFICATION_SERVICE_URL
);