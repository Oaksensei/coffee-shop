import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import promotionsController from "../controllers/promotionsController.js";

// Promotions routes - temporarily disable authentication
router.get("/", promotionsController.list);
router.post("/", promotionsController.create);
router.get("/:id", promotionsController.get);
router.put("/:id", promotionsController.update);
router.put("/:id/status", promotionsController.updateStatus);
router.delete("/:id", promotionsController.delete);

export default router;
