import { Router } from "express";
import { bookingProxy, bookingOrchestratorProxy } from "../proxy/service.proxy";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Protect all booking actions with JWT auth (injects x-user-id header)
router.use(authMiddleware);

// Route saga orchestrator endpoints
router.post(
  "/confirm",
  (req, _res, next) => {
    req.url = `/bookings/confirm`;
    next();
  },
  bookingOrchestratorProxy
);

router.post(
  "/:id/cancel",
  (req, _res, next) => {
    req.url = `/bookings/${req.params.id}/cancel`;
    next();
  },
  bookingOrchestratorProxy
);

// Prepend /bookings path and proxy remaining endpoints directly to booking-service
router.use(
  (req, _res, next) => {
    req.url = `/bookings${req.url === "/" ? "" : req.url}`;
    next();
  },
  bookingProxy
);

export default router;

