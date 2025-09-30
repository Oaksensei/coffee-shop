import db from "../db.js";

// GET /suppliers - List all suppliers
export const list = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const offset = (Math.max(Number(page), 1) - 1) * Number(limit);

    let whereClause = "";
    const params = [];

    if (q) {
      whereClause = "WHERE (name LIKE ? OR contact_name LIKE ? OR email LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [rows] = await db.execute(
      `SELECT id, name, contact_name, phone, email, address, status, created_at, updated_at
       FROM suppliers
       ${whereClause}
       ORDER BY name ASC
       LIMIT ${offset}, ${Number(limit)}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM suppliers ${whereClause}`,
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
    console.error("Suppliers list error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// POST /suppliers - Create new supplier
export const create = async (req, res) => {
  try {
    const { name, contact_name, phone, email, address, status } = req.body;

    const [result] = await db.execute(
      "INSERT INTO suppliers (name, contact_name, phone, email, address, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, contact_name, phone, email, address, status || "active"]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        contact_name,
        phone,
        email,
        address,
        status: status || "active",
      },
    });
  } catch (e) {
    console.error("Suppliers create error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// GET /suppliers/:id - Get single supplier
export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM suppliers WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("Suppliers get error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// PUT /suppliers/:id - Update supplier
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, phone, email, address, status } = req.body;

    const [result] = await db.execute(
      "UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, status = ? WHERE id = ?",
      [name, contact_name, phone, email, address, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, name, contact_name, phone, email, address, status },
    });
  } catch (e) {
    console.error("Suppliers update error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// PUT /suppliers/:id/status - Update supplier status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute(
      "UPDATE suppliers SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    res.json({ ok: true, data: { id, status } });
  } catch (e) {
    console.error("Suppliers updateStatus error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// DELETE /suppliers/:id - Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting supplier with ID:", id);

    // Direct delete - no foreign key constraints to worry about
    const [result] = await db.execute("DELETE FROM suppliers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    console.log("Supplier deleted successfully");
    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Suppliers delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// Default export with all methods
export default {
  list,
  create,
  get,
  update,
  updateStatus,
  delete: deleteSupplier,
};
