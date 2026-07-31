import { Router } from "express";
import { userProxy } from "../proxy/service.proxy";

const router = Router();

router.use("/auth", userProxy);

export default router;