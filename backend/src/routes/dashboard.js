const express = require("express");
const router = express.Router();
const { authGuard } = require("../middlewares/auth");
const c = require("../controllers/dashboardController");

// Dashboard routes - temporarily disable authentication
router.get("/summary", c.summary);
router.get("/trend", c.trend);
router.get("/top-products", c.topProducts);

module.exports = router;
