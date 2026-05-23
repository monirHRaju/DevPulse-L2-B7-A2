import { Router } from "express";
import { body } from "express-validator";
import { signup, login } from "../controllers/auth.controller.js";

const router = Router();

const signupValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["contributor", "maintainer"])
    .withMessage("Role must be either 'contributor' or 'maintainer'"),
];

const loginValidators = [
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/signup", signupValidators, signup);
router.post("/login", loginValidators, login);

export default router;
