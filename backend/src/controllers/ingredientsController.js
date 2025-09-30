import db from "../db.js";

export const createIngredient = async (req, res) => {
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
  } catch (error) {
    console.error("Error creating ingredient:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

export const getIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM ingredients WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "INGREDIENT_NOT_FOUND" });
    }

    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    console.error("Ingredients get error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id } = req.body;

    const [result] = await db.execute(
      "UPDATE ingredients SET name = ?, unit = ?, stock_qty = ?, reorder_point = ?, cost_per_unit = ?, supplier_id = ? WHERE id = ? AND deleted_at IS NULL",
      [name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "INGREDIENT_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, name, unit, stock_qty, reorder_point, cost_per_unit, supplier_id },
    });
  } catch (e) {
    console.error("Ingredients update error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting ingredient with ID:", id);

    // Direct delete - no foreign key constraints to worry about
    const [result] = await db.execute("DELETE FROM ingredients WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "INGREDIENT_NOT_FOUND" });
    }

    console.log("Ingredient deleted successfully");
    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Ingredients delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
};

export default {
  createIngredient,
  getIngredient,
  updateIngredient,
  deleteIngredient,
};
