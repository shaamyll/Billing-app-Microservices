import { Router } from "express";
import { tripProxy } from "../proxy/service.proxy";

const router = Router();

router.use((req, _res, next) => {
  req.url = `/buses${req.url === "/" ? "" : req.url}`;
  next();
});
router.use("/", tripProxy);

export default router;
