import { Router } from "express";
import {
  getPaymentById,
  processCharge,
  processRefund,
} from "../controllers/payment.controller";

const router = Router();

// Charge endpoints
router.post("/charge", processCharge);
router.post("/payments/charge", processCharge);

// Refund endpoints
router.post("/:id/refund", processRefund);
router.post("/payments/:id/refund", processRefund);

// Get payment status by ID
router.get("/:id", getPaymentById);
router.get("/payments/:id", getPaymentById);

export const paymentRoutes = router;
