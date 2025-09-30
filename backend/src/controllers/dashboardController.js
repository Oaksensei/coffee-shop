const db = require("../db");
const dayjs = require("dayjs");

// แปลงช่วงวันที่จาก query (?from=YYYY-MM-DD&to=YYYY-MM-DD)
function parseRange(q = {}) {
  const s = q.from ? dayjs(q.from).startOf("day") : dayjs().startOf("day");
  const e = q.to ? dayjs(q.to).endOf("day") : dayjs().endOf("day");
  return {
    from: s.format("YYYY-MM-DD HH:mm:ss"),
    to: e.format("YYYY-MM-DD HH:mm:ss"),
  };
}

// GET /dashboard/summary?from=&to=
async function summary(req, res) {
  try {
    const { from, to } = parseRange(req.query);

    // ยอดขายรวมวันนี้ + นับสถานะออเดอร์
    const [stat] = await db.execute(
      `
      SELECT
        SUM(CASE WHEN status='paid' THEN total ELSE 0 END) AS sales_total,
        SUM(CASE WHEN status='open' THEN 1 ELSE 0 END)  AS orders_open,
        SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END)  AS orders_paid,
        SUM(CASE WHEN status='cancel' THEN 1 ELSE 0 END) AS orders_cancel
      FROM orders
      WHERE created_at BETWEEN ? AND ?
      `,
      [from, to]
    );

    // สต็อกต่ำกว่า reorder
    const [low] = await db.execute(
      `
      SELECT id, name, unit, stock_qty, reorder_point
      FROM ingredients
      WHERE deleted_at IS NULL
        AND stock_qty < reorder_point
      ORDER BY (reorder_point - stock_qty) DESC
      LIMIT 10
      `
    );

    res.json({
      ok: true,
      data: {
        range: { from, to },
        today: {
          sales_total: Number(stat[0].sales_total || 0),
          orders_open: Number(stat[0].orders_open || 0),
          orders_paid: Number(stat[0].orders_paid || 0),
          orders_cancel: Number(stat[0].orders_cancel || 0),
        },
        low_stock: low,
      },
    });
  } catch (e) {
    console.error("dashboard.summary", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// GET /dashboard/trend?days=7
async function trend(req, res) {
  try {
    const days = Math.min(parseInt(req.query.days || "7", 10), 90);
    const start = dayjs()
      .subtract(days - 1, "day")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const end = dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const [rows] = await db.execute(
      `
      SELECT DATE(created_at) AS d,
             SUM(CASE WHEN status='paid' THEN total ELSE 0 END) AS sales_total,
             COUNT(*) AS orders_all,
             SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END) AS orders_paid
      FROM orders
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY d ASC
      `,
      [start, end]
    );

    // เติมวันที่ที่ไม่มีข้อมูลให้เป็นศูนย์
    const map = new Map(rows.map((r) => [dayjs(r.d).format("YYYY-MM-DD"), r]));
    const out = [];
    for (let i = 0; i < days; i++) {
      const d = dayjs(start).add(i, "day").format("YYYY-MM-DD");
      const r = map.get(d) || {};
      out.push({
        date: d,
        sales_total: Number(r.sales_total || 0),
        orders_all: Number(r.orders_all || 0),
        orders_paid: Number(r.orders_paid || 0),
      });
    }

    res.json({ ok: true, data: out });
  } catch (e) {
    console.error("dashboard.trend", e);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

// GET /dashboard/top-products?days=7&limit=5
async function topProducts(req, res) {
  try {
    const days = Math.min(parseInt(req.query.days || "7", 10), 90);
    const limit = Math.min(parseInt(req.query.limit || "5", 10), 50);
    const start = dayjs()
      .subtract(days - 1, "day")
      .startOf("day")
      .format("YYYY-MM-DD HH:mm:ss");
    const end = dayjs().endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const [rows] = await db.execute(
      `
      SELECT oi.product_id, oi.product_name,
             SUM(oi.qty) AS qty,
             SUM(oi.qty * oi.unit_price) AS amount
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at BETWEEN ? AND ? AND o.status='paid'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY qty DESC
      LIMIT ${limit}
      `,
      [start, end]
    );

    res.json({ ok: true, data: rows || [] });
  } catch (e) {
    console.error("dashboard.topProducts", e);
    res.json({ ok: true, data: [] });
  }
}

module.exports = { summary, trend, topProducts };
