import { Router } from "express";
import { userProxy } from "../proxy/service.proxy";

const router = Router();

router.use("/api/auth", userProxy);

export default router;