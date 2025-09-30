import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// ✅ allowlist: dev + โปรดักชันจาก ENV + URL ของ Tunnel
const allow = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://coffee-shop-4qjv5t6lm-oaksenseis-projects.vercel.app",
  process.env.FRONTEND_ORIGIN, // เช่น https://your-frontend.vercel.app
  process.env.TUNNEL_ORIGIN, // เช่น https://xxxx.trycloudflare.com
].filter(Boolean);

app.use(
  cors({
    origin: true, // อนุญาตทุก origin ชั่วคราว
    credentials: true,
  })
);

// ✅ session – ปลอดภัยอัตโนมัติเมื่อเป็น production/HTTPS
app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// health
app.get("/health", (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

import cors from "cors";

const ALLOW = ["https://coffee-shop-one-bice.vercel.app"]; // โดเมน Vercel จริงของคุณ
app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || ALLOW.includes(origin) ? cb(null, true) : cb(new Error("CORS")),
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());

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
