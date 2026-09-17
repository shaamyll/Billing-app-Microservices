import { Router } from "express";
import { createBus, getBusLayout } from "../controllers/busController";

const router = Router();

router.post("/", createBus);
router.get("/:id/layout", getBusLayout);

export { router as busRoutes };
