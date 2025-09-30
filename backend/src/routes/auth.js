const express = require("express");
const router = express.Router();

const { login, me } = require("../controllers/authController");
const { authGuard } = require("../middlewares/auth");

router.post("/login", login); // ⇒ POST /auth/login
router.get("/me", authGuard, me);

module.exports = router;
