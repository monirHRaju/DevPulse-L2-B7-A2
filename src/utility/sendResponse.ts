import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  status: number,
  message: string,
  data?: T
): Response =>
  res.status(status).json({
    success: true,
    message,
    data,
  });

export const sendError = (
  res: Response,
  status: number,
  message: string,
  errors?: unknown
): Response =>
  res.status(status).json({
    success: false,
    message,
    errors,
  });
