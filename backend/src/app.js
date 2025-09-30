// backend/src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";

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

// Security headers
app.use(helmet());

// ✅ CORS: allowlist ทั้ง dev, prod (Vercel), และ Tunnel
const allow = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_ORIGIN, // เช่น https://coffee-shop.vercel.app
  process.env.TUNNEL_ORIGIN, // เช่น https://xxxx.trycloudflare.com
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow health checks / curl
      cb(null, allow.includes(origin));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// ✅ Session middleware (ปลอดภัยขึ้นใน production)
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "coffee-shop-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true บน HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  })
);

// ✅ Health check
app.get("/health", (_req, res) =>
  res.json({ ok: true, service: "coffee-shop-backend", env: process.env.NODE_ENV || "dev" })
);

// Routers
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
