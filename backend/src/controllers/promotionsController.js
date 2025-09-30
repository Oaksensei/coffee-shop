const db = require("../db");

// GET /promotions - List all promotions
exports.list = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const offset = (Math.max(Number(page), 1) - 1) * Number(limit);

    let whereClause = "";
    const params = [];

    if (q) {
      whereClause = "WHERE (code LIKE ?)";
      params.push(`%${q}%`);
    }

    const [rows] = await db.execute(
      `SELECT id, code, type, value, min_spend, start_at, end_at, status, created_at, updated_at
       FROM promotions
       ${whereClause}
       ORDER BY start_at DESC, code ASC
       LIMIT ${offset}, ${Number(limit)}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM promotions ${whereClause}`,
      params
    );

    res.json({
      ok: true,
      data: rows,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (e) {
    console.error("Promotions list error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// POST /promotions - Create new promotion
exports.create = async (req, res) => {
  try {
    console.log("Create promotion request body:", req.body);
    const { name, description, code, type, value, min_spend, start_at, end_at, status } = req.body;

    console.log("Inserting promotion with values:", [
      code,
      type,
      value,
      min_spend,
      start_at,
      end_at,
      status || "active",
    ]);

    const [result] = await db.execute(
      "INSERT INTO promotions (code, type, value, min_spend, start_at, end_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [code, type, value, min_spend, start_at, end_at, status || "active"]
    );

    console.log("Insert result:", result);

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        code,
        type,
        value,
        min_spend,
        start_at,
        end_at,
        status: status || "active",
      },
    });
  } catch (e) {
    console.error("Promotions create error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// GET /promotions/:id - Get single promotion
exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM promotions WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("Promotions get error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// PUT /promotions/:id - Update promotion
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, code, type, value, min_spend, start_at, end_at, status } = req.body;

    const [result] = await db.execute(
      "UPDATE promotions SET code = ?, type = ?, value = ?, min_spend = ?, start_at = ?, end_at = ?, status = ? WHERE id = ?",
      [code, type, value, min_spend, start_at, end_at, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, code, type, value, min_spend, start_at, end_at, status },
    });
  } catch (e) {
    console.error("Promotions update error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// PUT /promotions/:id/status - Update promotion status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute(
      "UPDATE promotions SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({ ok: true, data: { id, status } });
  } catch (e) {
    console.error("Promotions updateStatus error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// DELETE /promotions/:id - Delete promotion
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM promotions WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Promotions delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};
