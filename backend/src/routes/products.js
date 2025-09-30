// src/routes/products.js
const express = require("express");
const router = express.Router();
const products = require("../controllers/productsController");
const { authGuard } = require("../middlewares/auth");

// Products routes - temporarily disable authentication
router.get("/", products.list); // /products?q=latte&page=1&limit=10
router.post("/", products.create); // POST /products
router.get("/:id", products.get); // GET /products/:id
router.put("/:id", products.update); // PUT /products/:id
router.delete("/:id", products.delete); // DELETE /products/:id

module.exports = router;
