// src/controllers/productsController.js
const db = require("../db");

exports.list = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (q) {
      whereClause = "WHERE (name LIKE ? OR description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await db.execute(
      `SELECT id, name, category, price, status, description, created_at, updated_at
       FROM products
       ${whereClause}
       ORDER BY updated_at DESC, id DESC
       LIMIT ${offset}, ${limit}`
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM products ${whereClause}`,
      params
    );

    res.json({
      ok: true,
      data: rows,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error("Products list error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category, price, status, description } = req.body;

    const [result] = await db.execute(
      "INSERT INTO products (name, category, price, status, description) VALUES (?, ?, ?, ?, ?)",
      [name, category, price, status || "active", description]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        category,
        price,
        status: status || "active",
        description,
      },
    });
  } catch (e) {
    console.error("Products create error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("Products get error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, status, description } = req.body;

    const [result] = await db.execute(
      "UPDATE products SET name = ?, category = ?, price = ?, status = ?, description = ? WHERE id = ?",
      [name, category, price, status, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
    }

    res.json({ ok: true, data: { id, name, category, price, status, description } });
  } catch (e) {
    console.error("Products update error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("Deleting product with ID:", id);

    // Direct delete - no foreign key constraints to worry about
    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
    }

    console.log("Product deleted successfully");
    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Products delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};
