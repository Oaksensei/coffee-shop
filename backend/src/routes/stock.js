const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const { receiveStock, adjustStock } = require("../controllers/stockController");

// Stock routes - temporarily disable authentication
router.post("/receive", receiveStock);
router.post("/adjust", adjustStock);

module.exports = router;
