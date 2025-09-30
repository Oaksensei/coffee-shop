const express = require("express");
const router = express.Router();
const { authGuard, sessionAuth } = require("../middlewares/auth");
const {
  createIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/ingredientsController");
const { listIngredients } = require("../controllers/stockController");

// Ingredients routes - temporarily disable authentication
router.get("/", listIngredients);
router.post("/", authGuard, createIngredient);
router.get("/:id", getIngredient);
router.put("/:id", authGuard, updateIngredient);
router.delete("/:id", authGuard, deleteIngredient);

module.exports = router;
