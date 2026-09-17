import { Request, Response, NextFunction } from "express";
import { CustomError, statusCode, JWTService, AppResponse } from "@billing/utils";
import { env } from "../config/dotenv";

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, statusCode.UNAUTHORIZED);
  }
}

const jwtService = new JWTService({
  accessSecret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
});

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authorization header missing or invalid format (Bearer token required)"
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = jwtService.verifyAccessToken(token);

    if (!payload || !payload.id) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    // Forward authenticated user identity in headers to downstream microservices
    req.headers["x-user-id"] = payload.id;
    req.headers["x-user-email"] = payload.email;
    req.headers["x-user-role"] = payload.role;

    next();
  } catch (error) {
    AppResponse.error(res, error);
  }
};
