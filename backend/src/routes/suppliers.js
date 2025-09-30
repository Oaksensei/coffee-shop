import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import suppliersController from "../controllers/suppliersController.js";

// Suppliers routes - temporarily disable authentication
router.get("/", suppliersController.list);
router.post("/", suppliersController.create);
router.get("/:id", suppliersController.get);
router.put("/:id", suppliersController.update);
router.put("/:id/status", suppliersController.updateStatus);
router.delete("/:id", suppliersController.delete);

export default router;
