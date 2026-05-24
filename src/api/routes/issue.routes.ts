import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createIssueHandler,
  listIssuesHandler,
  getIssueHandler,
  updateIssueHandler,
  deleteIssueHandler,
} from "../controllers/issue.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = Router();

const createValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title must be at most 150 characters"),
  body("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("type")
    .isIn(["bug", "feature_request"])
    .withMessage("Type must be 'bug' or 'feature_request'"),
];

const updateValidators = [
  param("id").isInt({ min: 1 }).withMessage("Issue id must be a positive integer"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title must be at most 150 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("type")
    .optional()
    .isIn(["bug", "feature_request"])
    .withMessage("Type must be 'bug' or 'feature_request'"),
];

const idParamValidator = [
  param("id").isInt({ min: 1 }).withMessage("Issue id must be a positive integer"),
];

const listValidators = [
  query("sort")
    .optional()
    .isIn(["newest", "oldest"])
    .withMessage("Sort must be 'newest' or 'oldest'"),
  query("type")
    .optional()
    .isIn(["bug", "feature_request"])
    .withMessage("Type filter must be 'bug' or 'feature_request'"),
  query("status")
    .optional()
    .isIn(["open", "in_progress", "resolved"])
    .withMessage("Status filter must be 'open', 'in_progress', or 'resolved'"),
];

router.post("/", authenticate, createValidators, createIssueHandler);
router.get("/", listValidators, listIssuesHandler);
router.get("/:id", idParamValidator, getIssueHandler);
router.patch("/:id", authenticate, updateValidators, updateIssueHandler);
router.delete(
  "/:id",
  authenticate,
  authorize("maintainer"),
  idParamValidator,
  deleteIssueHandler
);

export default router;
