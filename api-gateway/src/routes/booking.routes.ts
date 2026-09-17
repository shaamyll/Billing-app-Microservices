import { Router } from "express";
import { bookingProxy } from "../proxy/service.proxy";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Protect hold booking creation with JWT auth (injects x-user-id header)
router.use(authMiddleware)

// Prepend /bookings path and proxy to booking-service
router.use((req, _res, next) => {
  req.url = `/bookings${req.url === "/" ? "" : req.url}`;
  next();
});
router.use("/", bookingProxy);

export default router;
