const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const promotionsController = require("../controllers/promotionsController");

// Promotions routes - temporarily disable authentication
router.get("/", promotionsController.list);
router.post("/", promotionsController.create);
router.get("/:id", promotionsController.get);
router.put("/:id", promotionsController.update);
router.put("/:id/status", promotionsController.updateStatus);
router.delete("/:id", promotionsController.delete);

module.exports = router;
