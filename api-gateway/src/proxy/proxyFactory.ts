import { createProxyMiddleware } from "http-proxy-middleware";

export const createServiceProxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
  });