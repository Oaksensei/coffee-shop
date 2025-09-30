import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import inventoryController from "../controllers/inventoryController.js";

// Inventory routes - temporarily disable authentication
router.get("/", inventoryController.list);
router.post("/", inventoryController.create);
router.get("/:id", inventoryController.get);
router.put("/:id", inventoryController.update);
router.delete("/:id", inventoryController.delete);
router.post("/:id/adjust", inventoryController.adjustStock);

// Legacy routes for backward compatibility
router.get("/ingredients", inventoryController.list);
router.post("/receive", inventoryController.adjustStock);

// New general adjustment route
router.post("/adjust", inventoryController.adjust);

export default router;
