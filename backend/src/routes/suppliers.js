const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const suppliersController = require("../controllers/suppliersController");

// Suppliers routes - temporarily disable authentication
router.get("/", suppliersController.list);
router.post("/", suppliersController.create);
router.get("/:id", suppliersController.get);
router.put("/:id", suppliersController.update);
router.put("/:id/status", suppliersController.updateStatus);
router.delete("/:id", suppliersController.delete);

module.exports = router;
