const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const inventoryController = require("../controllers/inventoryController");

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

module.exports = router;
