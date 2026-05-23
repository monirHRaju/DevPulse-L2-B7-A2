import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utility/AppError.js";
import { verifyToken } from "../utility/jwt.js";
import type { Role } from "../types/index.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization;

  if (!token) {
    return next(
      new AppError(StatusCodes.UNAUTHORIZED, "Authorization token is required")
    );
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token"));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, "Authentication required")
      );
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          StatusCodes.FORBIDDEN,
          "You do not have permission to perform this action"
        )
      );
    }
    next();
  };
};
