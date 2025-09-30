const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "build")));

// Database connection
const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "12345",
  database: "coffee_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ ok: false, error: "INVALID_TOKEN" });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "MISSING_CREDENTIALS" });
    }

    // Check user in database
    const [users] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      ok: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Products API
app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const [products] = await db.execute(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: products });
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    const { name, category, price, description, status } = req.body;

    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const [result] = await db.execute(
      "INSERT INTO products (name, category, price, description, status) VALUES (?, ?, ?, ?, ?)",
      [name, category, price, description || "", status || "active"]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        category,
        price,
        description,
        status: status || "active",
      },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, status } = req.body;

    const [result] = await db.execute(
      "UPDATE products SET name = ?, category = ?, price = ?, description = ?, status = ? WHERE id = ?",
      [name, category, price, description, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, name, category, price, description, status },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
    }

    res.json({ ok: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Orders API
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: orders });
  } catch (error) {
    console.error("Orders error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute("SELECT * FROM orders WHERE id = ?", [
      id,
    ]);

    if (orders.length === 0) {
      return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
    }

    const [items] = await db.execute(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id]
    );

    res.json({
      ok: true,
      data: {
        ...orders[0],
        items,
      },
    });
  } catch (error) {
    console.error("Order detail error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
    }

    res.json({ ok: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Inventory API
app.get("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const [inventory] = await db.execute(
      "SELECT * FROM inventory ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: inventory });
  } catch (error) {
    console.error("Inventory error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.post("/api/inventory", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      stock_qty,
      min_stock,
      unit,
      cost_per_unit,
      supplier_id,
    } = req.body;

    if (!name || !category || !stock_qty || !min_stock) {
      return res
        .status(400)
        .json({ ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const [result] = await db.execute(
      "INSERT INTO inventory (name, category, stock_qty, min_stock, unit, cost_per_unit, supplier_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, category, stock_qty, min_stock, unit, cost_per_unit, supplier_id]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        category,
        stock_qty,
        min_stock,
        unit,
        cost_per_unit,
        supplier_id,
      },
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Suppliers API
app.get("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await db.execute(
      "SELECT * FROM suppliers ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: suppliers });
  } catch (error) {
    console.error("Suppliers error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.post("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const { name, contact_name, email, phone, address, status } = req.body;

    if (!name || !contact_name || !email) {
      return res
        .status(400)
        .json({ ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const [result] = await db.execute(
      "INSERT INTO suppliers (name, contact_name, email, phone, address, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, contact_name, email, phone, address, status || "active"]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        contact_name,
        email,
        phone,
        address,
        status: status || "active",
      },
    });
  } catch (error) {
    console.error("Create supplier error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.put("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, email, phone, address, status } = req.body;

    const [result] = await db.execute(
      "UPDATE suppliers SET name = ?, contact_name = ?, email = ?, phone = ?, address = ?, status = ? WHERE id = ?",
      [name, contact_name, email, phone, address, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: { id, name, contact_name, email, phone, address, status },
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.delete("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM suppliers WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "SUPPLIER_NOT_FOUND" });
    }

    res.json({ ok: true, message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete supplier error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Promotions API
app.get("/api/promotions", authenticateToken, async (req, res) => {
  try {
    const [promotions] = await db.execute(
      "SELECT * FROM promotions ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: promotions });
  } catch (error) {
    console.error("Promotions error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.post("/api/promotions", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      code,
      type,
      value,
      min_spend,
      start_at,
      end_at,
      status,
    } = req.body;

    if (!name || !code || !type || !value) {
      return res
        .status(400)
        .json({ ok: false, error: "MISSING_REQUIRED_FIELDS" });
    }

    const [result] = await db.execute(
      "INSERT INTO promotions (name, description, code, type, value, min_spend, start_at, end_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        code,
        type,
        value,
        min_spend,
        start_at,
        end_at,
        status || "active",
      ]
    );

    res.status(201).json({
      ok: true,
      data: {
        id: result.insertId,
        name,
        description,
        code,
        type,
        value,
        min_spend,
        start_at,
        end_at,
        status: status || "active",
      },
    });
  } catch (error) {
    console.error("Create promotion error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.put("/api/promotions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      code,
      type,
      value,
      min_spend,
      start_at,
      end_at,
      status,
    } = req.body;

    const [result] = await db.execute(
      "UPDATE promotions SET name = ?, description = ?, code = ?, type = ?, value = ?, min_spend = ?, start_at = ?, end_at = ?, status = ? WHERE id = ?",
      [
        name,
        description,
        code,
        type,
        value,
        min_spend,
        start_at,
        end_at,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({
      ok: true,
      data: {
        id,
        name,
        description,
        code,
        type,
        value,
        min_spend,
        start_at,
        end_at,
        status,
      },
    });
  } catch (error) {
    console.error("Update promotion error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.delete("/api/promotions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM promotions WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "PROMOTION_NOT_FOUND" });
    }

    res.json({ ok: true, message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Delete promotion error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Dashboard API
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Get products count
    const [productsResult] = await db.execute(
      "SELECT COUNT(*) as count FROM products"
    );
    const totalProducts = productsResult[0].count;

    // Get today's orders
    const [ordersResult] = await db.execute(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE DATE(created_at) = ?",
      [today]
    );
    const todayOrders = ordersResult[0].count;
    const todayRevenue = ordersResult[0].revenue;

    // Get low stock items
    const [lowStockResult] = await db.execute(
      "SELECT COUNT(*) as count FROM inventory WHERE stock_qty <= min_stock"
    );
    const lowStockItems = lowStockResult[0].count;

    // Get recent orders
    const [recentOrders] = await db.execute(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"
    );

    // Get top products
    const [topProducts] = await db.execute(
      'SELECT * FROM products WHERE status = "active" ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      ok: true,
      data: {
        metrics: {
          totalProducts,
          todayOrders,
          todayRevenue,
          lowStockItems,
        },
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

// Serve React app
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
