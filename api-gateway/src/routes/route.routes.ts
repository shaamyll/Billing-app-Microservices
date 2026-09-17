import { Router } from "express";
import { routeProxy } from "../proxy/service.proxy";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware)

router.use("/", routeProxy);

export default router;
