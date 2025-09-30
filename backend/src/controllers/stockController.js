const db = require("../db");

// GET /ingredients?low_only=1&supplier_id=
async function listIngredients(req, res) {
  try {
    const { q = "", low_only, supplier_id } = req.query;
    const params = [];
    let where = "i.deleted_at IS NULL";
    if (q) {
      where += " AND i.name LIKE ?";
      params.push(`%${q}%`);
    }
    if (supplier_id) {
      where += " AND i.supplier_id = ?";
      params.push(Number(supplier_id));
    }
    if (String(low_only) === "1") {
      where += " AND i.stock_qty < i.reorder_point";
    }

    const [rows] = await pool.query(
      `SELECT i.id, i.name, i.unit, i.stock_qty, i.reorder_point, i.supplier_id, s.name AS supplier, i.updated_at
       FROM ingredients i
       LEFT JOIN suppliers s ON s.id = i.supplier_id
       WHERE ${where}
       ORDER BY i.name ASC`,
      params
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listIngredients", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// POST /inventory/receive  {supplier_id, date, items:[{ingredient_id, qty, price_per_unit?}]}
async function receiveStock(req, res) {
  const conn = await db.getConnection();
  try {
    console.log("Receive stock request body:", req.body);
    const { supplier_id = null, date = null, items = [] } = req.body;
    console.log("Parsed receive data:", { supplier_id, date, items });

    if (!Array.isArray(items) || items.length === 0) {
      console.log("No items provided");
      return res.status(400).json({ ok: false, error: "NO_ITEMS" });
    }

    await conn.beginTransaction();

    for (const it of items) {
      const qty = Number(it.qty);
      if (!it.ingredient_id || !(qty > 0)) continue;

      // เพิ่มสต็อก
      await conn.execute(
        `UPDATE ingredients SET stock_qty = stock_qty + ?, updated_at=NOW() WHERE id=?`,
        [qty, it.ingredient_id]
      );

      // stock movement log
      await conn.execute(
        `INSERT INTO stock_movements (ingredient_id, type, qty, reason, ref, created_at)
         VALUES (?,?,?,?,?, COALESCE(?, NOW()))`,
        [
          it.ingredient_id,
          "receive",
          qty,
          null,
          JSON.stringify({ supplier_id, price_per_unit: it.price_per_unit || null }),
          date,
        ]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error("receiveStock", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
}

// POST /inventory/adjust  {reason, items:[{ingredient_id, qty}]}   // ใส่ + / - ได้
async function adjustStock(req, res) {
  const conn = await db.getConnection();
  try {
    const { reason = "adjust", items = [] } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ ok: false, error: "NO_ITEMS" });

    await conn.beginTransaction();
    for (const it of items) {
      const qty = Number(it.qty);
      if (!it.ingredient_id || !qty) continue;

      await conn.execute(
        `UPDATE ingredients SET stock_qty = stock_qty + ?, updated_at=NOW() WHERE id=?`,
        [qty, it.ingredient_id]
      );

      await conn.execute(
        `INSERT INTO stock_movements (ingredient_id, type, qty, reason, ref)
         VALUES (?,?,?,?,NULL)`,
        [it.ingredient_id, "adjust", qty, reason]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error("adjustStock", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
}

module.exports = { listIngredients, receiveStock, adjustStock };
