import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";
import {
  createIssue,
  listIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../services/issue.service.js";
import { sendSuccess, sendError } from "../../utility/sendResponse.js";
import type {
  CreateIssueBody,
  UpdateIssueBody,
  ListIssuesQuery,
} from "../../types/index.js";

const checkValidation = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, StatusCodes.BAD_REQUEST, "Validation failed", errors.array());
    return false;
  }
  return true;
};

export const createIssueHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!checkValidation(req, res)) return;

  try {
    const reporterId = req.user!.id;
    const issue = await createIssue(req.body as CreateIssueBody, reporterId);
    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const listIssuesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!checkValidation(req, res)) return;

  try {
    const issues = await listIssues(req.query as ListIssuesQuery);
    sendSuccess(res, StatusCodes.OK, "Issues retrieved successfully", issues);
  } catch (err) {
    next(err);
  }
};

export const getIssueHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!checkValidation(req, res)) return;

  try {
    const id = Number(req.params.id);
    const issue = await getIssueById(id);
    sendSuccess(res, StatusCodes.OK, "Issue retrieved successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const updateIssueHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!checkValidation(req, res)) return;

  try {
    const id = Number(req.params.id);
    const issue = await updateIssue(id, req.body as UpdateIssueBody, req.user!);
    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
  } catch (err) {
    next(err);
  }
};

export const deleteIssueHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!checkValidation(req, res)) return;

  try {
    const id = Number(req.params.id);
    await deleteIssue(id);
    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
  } catch (err) {
    next(err);
  }
};
