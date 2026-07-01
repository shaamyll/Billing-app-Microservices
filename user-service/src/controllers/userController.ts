import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { AppResponse, statusCode } from "../../../utils/src";

export class UserController {
private readonly userService: UserService;
  constructor({ userService }: { userService: UserService }) {
    this.userService = userService;
  }

register = async (req: Request, res: Response, next:NextFunction) => {
    try {
      const { name, email, password, role } = req.body;

      const user = await this.userService.register({
        name,
        email,
        password,
        role,
      });

      return AppResponse.success(res, statusCode.CREATED, user, "User registered successfully");
    } catch (error) {
      next(error)
    }
  };
}