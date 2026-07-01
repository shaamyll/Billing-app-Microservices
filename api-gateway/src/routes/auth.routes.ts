import { Router } from "express";
import { userProxy } from "../proxy/service.proxy";

const router = Router();

router.use("/", userProxy);

export default router;