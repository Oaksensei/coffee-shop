import express from "express";
const router = express.Router();
import { authGuard } from "../middlewares/auth.js";
import c from "../controllers/dashboardController.js";

// Dashboard routes - temporarily disable authentication
router.get("/summary", c.summary);
router.get("/trend", c.trend);
router.get("/top-products", c.topProducts);

export default router;
