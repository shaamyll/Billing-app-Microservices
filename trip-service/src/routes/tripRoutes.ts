import { Router } from "express";
import {
  createTrip,
  searchTrips,
  getTripWithLayout,
  getTripSeats,
} from "../controllers/tripController";

const router = Router();

router.post("/", createTrip);
router.get("/", searchTrips);
router.get("/:id", getTripWithLayout);
router.get("/:id/seats", getTripSeats);

export { router as tripRoutes };
