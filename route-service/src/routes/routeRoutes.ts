import { Router } from "express";
import {
  createRoute,
  getAllRoutes,
  getRouteStops,
} from "../controllers/routeController";

const router = Router();

router.post("/", createRoute);
router.get("/", getAllRoutes);
router.get("/:id/stops", getRouteStops);

export { router as routeRoutes };
