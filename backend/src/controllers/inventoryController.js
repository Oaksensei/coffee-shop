import db from "../db.js";

// GET /inventory - List all inventory items
export const list = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;
    const offset = (Math.max(Number(page), 1) - 1) * Number(limit);

    let whereClause = "";
    const params = [];

    if (q) {
      whereClause = "WHERE (i.name LIKE ?)";
      params.push(`%${q}%`);
    }

    const [rows] = await db.execute(
      `SELECT i.id, i.name, i.unit, i.stock_qty, i.reorder_point as min_stock, 
              CASE 
                WHEN i.stock_qty <= 0 THEN 'out_of_stock'
                WHEN i.stock_qty <= i.reorder_point THEN 'low' 
                ELSE 'good' 
              END as status,
              i.cost_per_unit, i.supplier_id, i.created_at, i.updated_at
       FROM ingredients i
       ${whereClause}
       ORDER BY i.name ASC
       LIMIT ${offset}, ${Number(limit)}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM ingredients i ${whereClause}`,
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
    console.error("Inventory list error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// POST /inventory - Create new inventory item
export const create = async (req, res) => {
  try {
    const { name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id } = req.body;

    const [result] = await db.execute(
      "INSERT INTO ingredients (name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, unit, stock_qty || 0, reorder_point || 0, cost_per_unit, supplier_id]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        unit,
        stock_qty: stock_qty || 0,
        reorder_point: reorder_point || 0,
        cost_per_unit,
        supplier_id,
      },
    });
  } catch (e) {
    console.error("Inventory create error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// GET /inventory/:id - Get single inventory item
export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM ingredients WHERE id = ? AND 1=1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "INVENTORY_NOT_FOUND" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("Inventory get error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// PUT /inventory/:id - Update inventory item
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id } = req.body;

    const [result] = await db.execute(
      "UPDATE ingredients SET name = ?, unit = ?, stock_qty = ?, reorder_point = ?, cost_per_unit = ?, supplier_id = ? WHERE id = ?",
      [name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "INVENTORY_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id },
    });
  } catch (e) {
    console.error("Inventory update error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// DELETE /inventory/:id - Delete inventory item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if item exists first
    const [checkRows] = await db.execute("SELECT id FROM ingredients WHERE id = ?", [id]);

    if (checkRows.length === 0) {
      return res.status(404).json({ ok: false, error: "INVENTORY_NOT_FOUND" });
    }

    // Hard delete - permanently remove from database
    const [result] = await db.execute("DELETE FROM ingredients WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "INVENTORY_NOT_FOUND" });
    }

    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Inventory delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// POST /inventory/:id/adjust - Adjust stock quantity
export const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, reason } = req.body;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Update stock quantity
      const [result] = await conn.execute(
        "UPDATE ingredients SET stock_qty = stock_qty + ?, updated_at = NOW() WHERE id = ? AND 1=1",
        [qty, id]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ ok: false, error: "INVENTORY_NOT_FOUND" });
      }

      // Record stock movement
      await conn.execute(
        "INSERT INTO stock_movements (ingredient_id, type, qty, reason, ref) VALUES (?, ?, ?, ?, ?)",
        [
          id,
          "adjust",
          qty,
          reason || "Manual adjustment",
          JSON.stringify({ user_id: req.user?.id }),
        ]
      );

      await conn.commit();

      // Get updated item
      const [rows] = await conn.execute("SELECT * FROM ingredients WHERE id = ? AND 1=1", [id]);

      res.json({ ok: true, data: rows[0] });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error("Inventory adjust error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// POST /inventory/adjust - General stock adjustment
export const adjust = async (req, res) => {
  try {
    const {
      item_id,
      adjustment_type,
      amount,
      reason,
      notes,
      quantity,
      cost_per_unit,
      supplier_id,
    } = req.body;

    if (!item_id) {
      return res.status(400).json({ ok: false, error: "MISSING_ITEM_ID" });
    }

    if (adjustment_type === "receive" && !quantity) {
      console.log("Missing quantity for receive type");
      return res.status(400).json({ ok: false, error: "MISSING_QUANTITY" });
    }

    if (adjustment_type !== "receive" && !amount) {
      console.log("Missing amount for non-receive type");
      return res.status(400).json({ ok: false, error: "MISSING_AMOUNT" });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let newStockQty;
      let adjustmentQty;

      if (adjustment_type === "receive") {
        // Receive stock - add to existing
        adjustmentQty = quantity || amount;
        console.log("Receive adjustment - item_id:", item_id, "quantity:", adjustmentQty);
        const [currentStock] = await conn.execute(
          "SELECT stock_qty FROM ingredients WHERE id = ?",
          [item_id]
        );

        if (currentStock.length === 0) {
          await conn.rollback();
          return res.status(404).json({ ok: false, error: "ITEM_NOT_FOUND" });
        }

        newStockQty = parseFloat(currentStock[0].stock_qty) + parseFloat(adjustmentQty);
        console.log("New stock quantity:", newStockQty);
      } else if (adjustment_type === "increase") {
        // Increase stock
        adjustmentQty = amount;
        const [currentStock] = await conn.execute(
          "SELECT stock_qty FROM ingredients WHERE id = ? AND 1=1",
          [item_id]
        );

        if (currentStock.length === 0) {
          await conn.rollback();
          return res.status(404).json({ ok: false, error: "ITEM_NOT_FOUND" });
        }

        newStockQty = currentStock[0].stock_qty + adjustmentQty;
      } else if (adjustment_type === "decrease") {
        // Decrease stock
        adjustmentQty = -amount;
        const [currentStock] = await conn.execute(
          "SELECT stock_qty FROM ingredients WHERE id = ? AND 1=1",
          [item_id]
        );

        if (currentStock.length === 0) {
          await conn.rollback();
          return res.status(404).json({ ok: false, error: "ITEM_NOT_FOUND" });
        }

        newStockQty = currentStock[0].stock_qty - amount;
        if (newStockQty < 0) {
          await conn.rollback();
          return res.status(400).json({ ok: false, error: "INSUFFICIENT_STOCK" });
        }
      } else if (adjustment_type === "set") {
        // Set to specific amount
        newStockQty = amount;
        adjustmentQty = amount;
      } else {
        await conn.rollback();
        return res.status(400).json({ ok: false, error: "INVALID_ADJUSTMENT_TYPE" });
      }

      // Update stock quantity
      const [result] = await conn.execute(
        "UPDATE ingredients SET stock_qty = ?, updated_at = NOW() WHERE id = ? AND 1=1",
        [newStockQty, item_id]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ ok: false, error: "ITEM_NOT_FOUND" });
      }

      // Update cost_per_unit if provided
      if (cost_per_unit) {
        await conn.execute(
          "UPDATE ingredients SET cost_per_unit = ?, updated_at = NOW() WHERE id = ? AND 1=1",
          [cost_per_unit, item_id]
        );
      }

      // Update supplier if provided
      if (supplier_id) {
        await conn.execute(
          "UPDATE ingredients SET supplier_id = ?, updated_at = NOW() WHERE id = ? AND 1=1",
          [supplier_id, item_id]
        );
      }

      await conn.commit();

      // Get updated item
      const [rows] = await conn.execute("SELECT * FROM ingredients WHERE id = ? AND 1=1", [
        item_id,
      ]);

      res.json({
        ok: true,
        data: rows[0],
        adjustment: {
          type: adjustment_type,
          amount: adjustmentQty,
          new_stock: newStockQty,
        },
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error("Inventory adjust error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

// Default export with all methods
export default {
  list,
  create,
  get,
  update,
  delete: deleteItem,
  adjustStock,
  adjust,
};
