import express from "express";
const router = express.Router();
import { authGuard, sessionAuth } from "../middlewares/auth.js";
import {
  createIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredientsController.js";
import { listIngredients } from "../controllers/stockController.js";

// Ingredients routes - temporarily disable authentication
router.get("/", listIngredients);
router.post("/", authGuard, createIngredient);
router.get("/:id", getIngredient);
router.put("/:id", authGuard, updateIngredient);
router.delete("/:id", authGuard, deleteIngredient);

export default router;
