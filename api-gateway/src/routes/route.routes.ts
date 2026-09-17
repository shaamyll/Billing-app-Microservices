import { Router } from "express";
import { routeProxy } from "../proxy/service.proxy";

const router = Router();

router.use("/", routeProxy);

export default router;
