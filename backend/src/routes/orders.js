const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const c = require("../controllers/ordersController");

// Temporarily disable authentication for testing
router.post("/", c.createOrder);
router.get("/", c.listOrders);
router.get("/:id", c.getOrder);
router.put("/:id/status", c.updateOrderStatus);
router.delete("/:id", c.deleteOrder);

module.exports = router;
