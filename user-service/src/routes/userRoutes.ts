import { Router } from "express";
import { UserController } from "../controllers/userController";
import { container } from "../container";

const router =  Router();

const userController = container.resolve<UserController>("userController");

router.post("/register", userController.register);

export {router as userRoutes};