import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import c from "../controllers/ordersController.js";

// Temporarily disable authentication for testing
router.post("/", c.createOrder);
router.get("/", c.listOrders);
router.get("/:id", c.getOrder);
router.put("/:id/status", c.updateOrderStatus);
router.delete("/:id", c.deleteOrder);

export default router;
