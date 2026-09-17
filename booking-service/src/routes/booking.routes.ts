import { Router } from "express";
import {
  checkAvailability,
  createHold,
} from "../controllers/booking.controller";

const router = Router();

// Seat segment availability check
router.get("/trips/:tripId/seats/:seatId/availability", checkAvailability);

// Booking hold creation
router.post("/hold", createHold);
router.post("/bookings/hold", createHold);

export const bookingRoutes = router;
