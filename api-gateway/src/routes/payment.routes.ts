import { Router } from "express";
import { paymentProxy } from "../proxy/service.proxy";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Protect payment endpoints with JWT auth (injects x-user-id header)
router.use(authMiddleware);

// Prepend /payments path and proxy to payment-service
router.use((req, _res, next) => {
  req.url = `/payments${req.url === "/" ? "" : req.url}`;
  next();
});
router.use("/", paymentProxy);

export default router;
