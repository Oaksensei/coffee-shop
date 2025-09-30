import express from "express";
const router = express.Router();

import { login, me } from "../controllers/authController.js";
import { authGuard } from "../middlewares/auth.js";

router.post("/login", login); // ⇒ POST /auth/login
router.get("/me", authGuard, me);

export default router;
