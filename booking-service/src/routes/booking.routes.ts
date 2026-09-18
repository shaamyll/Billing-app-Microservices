import { Router } from "express";
import {
  checkAvailability,
  confirmBooking,
  createHold,
  releaseBooking,
} from "../controllers/booking.controller";

const router = Router();

// Seat segment availability check
router.get("/trips/:tripId/seats/:seatId/availability", checkAvailability);

// Booking hold creation
router.post("/hold", createHold);
router.post("/bookings/hold", createHold);

// Confirm booking
router.post("/:id/confirm", confirmBooking);
router.post("/bookings/:id/confirm", confirmBooking);

// Release booking
router.post("/:id/release", releaseBooking);
router.post("/bookings/:id/release", releaseBooking);

export const bookingRoutes = router;

