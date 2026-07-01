import { NextFunction, Request, Response } from "express";
import { AppResponse, statusCode } from "@billing/utils";
import { UserService } from "../services/userService";
import { container } from "../container";

const userService = container.resolve<UserService>("userService");

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await userService.register({
      name,
      email,
      password,
      role,
    });

    return AppResponse.success(
      res,
      statusCode.CREATED,
      user,
      "User registered successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const result = await userService.login({
      email,
      password,
    });

    return AppResponse.success(
      res,
      statusCode.SUCCESS,
      result,
      "Login successful",
    );
  } catch (error) {
    next(error);
  }
};