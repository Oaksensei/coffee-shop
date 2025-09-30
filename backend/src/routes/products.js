// src/routes/products.js
import express from "express";
const router = express.Router();
import products from "../controllers/productsController.js";
import { authGuard } from "../middlewares/auth.js";

// Products routes - temporarily disable authentication
router.get("/", products.list); // /products?q=latte&page=1&limit=10
router.post("/", products.create); // POST /products
router.get("/:id", products.get); // GET /products/:id
router.put("/:id", products.update); // PUT /products/:id
router.delete("/:id", products.delete); // DELETE /products/:id

export default router;
