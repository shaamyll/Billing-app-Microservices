import { Router } from "express";
import {
  confirmBookingSaga,
  cancelBookingSaga,
} from "../controllers/bookingOrchestrator.controller";

const router = Router();

// Full saga endpoints
router.post("/confirm", confirmBookingSaga);
router.post("/bookings/confirm", confirmBookingSaga);

router.post("/:id/cancel", cancelBookingSaga);
router.post("/bookings/:id/cancel", cancelBookingSaga);

export const orchestratorRoutes = router;
