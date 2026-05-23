import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";
import { signupUser, loginUser } from "../services/auth.service.js";
import { sendSuccess, sendError } from "../../utility/sendResponse.js";
import type { SignupBody, LoginBody } from "../../types/index.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, StatusCodes.BAD_REQUEST, "Validation failed", errors.array());
    return;
  }

  try {
    const user = await signupUser(req.body as SignupBody);
    sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, StatusCodes.BAD_REQUEST, "Validation failed", errors.array());
    return;
  }

  try {
    const data = await loginUser(req.body as LoginBody);
    sendSuccess(res, StatusCodes.OK, "Login successful", data);
  } catch (err) {
    next(err);
  }
};
