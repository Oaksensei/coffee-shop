import express from "express";

// Routers
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import inventoryRouter from "./routes/inventory.js";
import dashboardRouter from "./routes/dashboard.js";
import ordersRouter from "./routes/orders.js";
import promotionsRouter from "./routes/promotions.js";
import suppliersRouter from "./routes/suppliers.js";
import ingredientsRouter from "./routes/ingredients.js";
import stockRouter from "./routes/stock.js";

const app = express();

// CORS middleware แบบง่ายที่สุด
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// JSON parser
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

// Database initialization endpoint
app.post("/init-db", async (_req, res) => {
  try {
    const db = await import("./db.js");
    const connection = await db.default.getConnection();
    
    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NULL,
        role_id INT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME NULL,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
          ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);
    
    // Insert default data
    await connection.execute(`
      INSERT IGNORE INTO roles (name) VALUES ('Admin'),('Cashier'),('Barista')
    `);
    
    await connection.execute(`
      INSERT IGNORE INTO users (username, password_hash, full_name, role_id, is_active)
      VALUES (
        'admin',
        '$2a$10$vnwuoSse1z5SEjF5YEY/YeKhvIX6tvLszYl6gFVNbpBw/H2/Ej9xa',
        'Administrator',
        (SELECT id FROM roles WHERE name='Admin'),
        1
      )
    `);
    
    connection.release();
    res.json({ ok: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Database initialization failed:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Routes
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/inventory", inventoryRouter);
app.use("/dashboard", dashboardRouter);
app.use("/orders", ordersRouter);
app.use("/promotions", promotionsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/stock", stockRouter);

export default app;
