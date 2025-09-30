import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import { receiveStock, adjustStock } from "../controllers/stockController.js";

// Stock routes - temporarily disable authentication
router.post("/receive", receiveStock);
router.post("/adjust", adjustStock);

export default router;
