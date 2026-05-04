import { Router } from "express";
import {
  registerUser,
  loginUser,
  registerValidation,
  loginValidation,
} from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register
router.post("/register", registerValidation, registerUser);

// POST /api/auth/login
router.post("/login", loginValidation, loginUser);

export default router;
