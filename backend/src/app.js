// backend/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");
const productsRouter = require("./routes/products");
const inventoryRouter = require("./routes/inventory");
const dashboardRouter = require("./routes/dashboard");
const ordersRouter = require("./routes/orders");
const promotionsRouter = require("./routes/promotions");
const suppliersRouter = require("./routes/suppliers");
const ingredientsRouter = require("./routes/ingredients");
const stockRouter = require("./routes/stock");

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "coffee-shop-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.get("/health", (_req, res) => res.json({ ok: true, service: "coffee-shop-backend" }));

app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/inventory", inventoryRouter);
app.use("/dashboard", dashboardRouter);
app.use("/orders", ordersRouter);
app.use("/promotions", promotionsRouter);
app.use("/suppliers", suppliersRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/stock", stockRouter);

module.exports = app;
