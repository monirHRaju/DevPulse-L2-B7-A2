import type { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { AppError } from "../utility/AppError.js";
import { sendError } from "../utility/sendResponse.js";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new AppError(
      StatusCodes.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  console.error("Unhandled error:", err);
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    ReasonPhrases.INTERNAL_SERVER_ERROR
  );
};
