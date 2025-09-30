const db = require("../db");

// POST /orders  body: { items:[{product_id, qty, options?}], pay_method, discount_code? , note?, customer? }
async function createOrder(req, res) {
  const conn = await db.getConnection();
  try {
    const {
      items = [],
      pay_method = "cash",
      discount_code = null,
      note = null,
      customer = null,
      status = "paid",
    } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ ok: false, error: "EMPTY_CART" });

    await conn.beginTransaction();

    // คำนวณราคา: ดึงราคาสินค้า + สูตร เพื่อหักสต็อกวัตถุดิบ
    let subTotal = 0;
    for (const it of items) {
      const qty = Number(it.qty);
      if (!it.product_id || !(qty > 0))
        return res.status(400).json({ ok: false, error: "INVALID_ITEM" });

      const [[p]] = await conn.execute(
        `SELECT id, price FROM products WHERE id=? AND deleted_at IS NULL`,
        [it.product_id]
      );
      if (!p) return res.status(400).json({ ok: false, error: "PRODUCT_NOT_FOUND" });

      const line = p.price * qty; // TODO: apply options/upsell if needed
      subTotal += line;
    }

    // ตรวจโปรโมชั่นตาม discount_code
    let discount = 0;
    if (discount_code) {
      const [[promotion]] = await conn.execute(
        `SELECT type, value, min_spend FROM promotions 
         WHERE code = ? AND status = 'active' 
         AND (start_at IS NULL OR start_at <= NOW()) 
         AND (end_at IS NULL OR end_at >= NOW())`,
        [discount_code]
      );

      if (promotion) {
        // ตรวจสอบเงื่อนไข minimum spend
        if (!promotion.min_spend || subTotal >= promotion.min_spend) {
          if (promotion.type === "percent" || promotion.type === "percentage") {
            discount = (subTotal * promotion.value) / 100;
          } else if (promotion.type === "fixed" || promotion.type === "amount") {
            discount = Math.min(promotion.value, subTotal);
          }
        }
      }
    }
    const total = subTotal - discount;

    // บันทึกหัวบิล
    const [ins] = await conn.execute(
      `INSERT INTO orders (status, pay_method, sub_total, discount, total, note, customer)
       VALUES (?,?,?,?,?,?,?)`,
      [status, pay_method, subTotal, discount, total, note, customer]
    );
    const orderId = ins.insertId;

    // บันทึกรายการ + หักสต็อกวัตถุดิบตามสูตร
    for (const it of items) {
      const qty = Number(it.qty);
      const [[p]] = await conn.execute(`SELECT id, name, price FROM products WHERE id=?`, [
        it.product_id,
      ]);
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, qty, unit_price, options_json)
         VALUES (?,?,?,?,?,?)`,
        [orderId, p.id, p.name, qty, p.price, JSON.stringify(it.options || null)]
      );

      // หักสต็อกจากสูตร
      const [recipe] = await conn.execute(
        `SELECT ingredient_id, qty FROM product_recipes WHERE product_id=?`,
        [p.id]
      );
      for (const r of recipe) {
        const useQty = r.qty * qty * -1; // หักออก
        await conn.execute(
          `UPDATE ingredients SET stock_qty = stock_qty + ?, updated_at=NOW() WHERE id=?`,
          [useQty, r.ingredient_id]
        );
        await conn.execute(
          `INSERT INTO stock_movements (ingredient_id, type, qty, reason, ref)
           VALUES (?,?,?, 'consume', ?)`,
          [
            r.ingredient_id,
            "adjust",
            useQty,
            JSON.stringify({ order_id: orderId, product_id: p.id }),
          ]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ ok: true, data: { id: orderId, total } });
  } catch (e) {
    await conn.rollback();
    console.error("createOrder", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  } finally {
    conn.release();
  }
}

// GET /orders?status=&q=&page=&pageSize=
async function listOrders(req, res) {
  try {
    const { status, q = "", page = 1, pageSize = 20 } = req.query;
    const limit = Math.min(Number(pageSize) || 20, 100);
    const offset = (Math.max(Number(page), 1) - 1) * limit;

    const params = [];
    let where = "o.deleted_at IS NULL";
    if (status) {
      where += " AND o.status=?";
      params.push(status);
    }
    if (q) {
      where += " AND (o.id LIKE ? OR o.customer LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await db.execute(
      `SELECT o.id, o.status, o.pay_method, o.total, o.customer, o.created_at,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
       FROM orders o
       WHERE ${where}
       ORDER BY o.id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM orders o WHERE ${where}`,
      params
    );

    res.json({ ok: true, data: rows, pagination: { total, page: Number(page), pageSize: limit } });
  } catch (e) {
    console.error("listOrders", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// GET /orders/:id
async function getOrder(req, res) {
  try {
    const id = Number(req.params.id);
    const [[o]] = await db.execute(
      `SELECT o.id, o.status, o.pay_method, o.sub_total, o.discount, o.total, o.note, o.customer, o.created_at, o.discount_code,
              p.id as promotion_id, p.code as promotion_code, p.type as promotion_type, p.value as promotion_value, p.min_spend as promotion_min_spend
       FROM orders o
       LEFT JOIN promotions p ON o.discount_code = p.code AND p.deleted_at IS NULL
       WHERE o.id=? AND o.deleted_at IS NULL`,
      [id]
    );
    if (!o) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

    const [items] = await db.execute(
      `SELECT product_id, product_name, qty, unit_price, options_json
       FROM order_items WHERE order_id=?`,
      [id]
    );

    res.json({ ok: true, data: { ...o, items } });
  } catch (e) {
    console.error("getOrder", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// PUT /orders/:id  {status}
async function updateOrderStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    console.log("updateOrderStatus - Request:", { id, status, body: req.body });

    const [result] = await db.execute(
      `UPDATE orders SET status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`,
      [status, id]
    );

    console.log("updateOrderStatus - Database result:", result);

    if (result.affectedRows === 0) {
      console.log("updateOrderStatus - No rows affected");
      return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
    }

    console.log("updateOrderStatus - Success");
    res.json({ ok: true, data: { id, status } });
  } catch (e) {
    console.error("updateOrderStatus - Error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// DELETE /orders/:id - Delete order
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    console.log("Deleting order with ID:", id);

    // Direct delete - no foreign key constraints to worry about
    const [result] = await db.execute("DELETE FROM orders WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
    }

    console.log("Order deleted successfully");
    res.json({ ok: true, data: { id, deleted: true } });
  } catch (e) {
    console.error("Orders delete error:", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus, deleteOrder };
