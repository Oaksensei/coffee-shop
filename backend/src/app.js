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

const ALLOW = new Set([
  "https://coffee-shop-4qjv5t6lm-oaksenseis-projects.vercel.app", // โดเมนที่คุณกำลังเปิดอยู่
  // ถ้ามีโดเมนโปรดักชันหลัก ให้ใส่เพิ่มตรงนี้ด้วย เช่น:
  // "https://coffee-shop.vercel.app",
]);

app.set("trust proxy", 1);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);                // อนุญาตเครื่องมือ/health check ที่ไม่มี origin
    if (ALLOW.has(origin)) return cb(null, true);      // อนุญาตเฉพาะโดเมนที่กำหนด
    // (ถ้าจะอนุญาตทุก preview ของ vercel ชั่วคราว: 
    //   if (/\.vercel\.app$/.test(new URL(origin).hostname)) return cb(null, true);
    // )
    cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ให้ preflight (OPTIONS) ผ่านทุก path
app.options("*", cors());

// ✅ session – ปลอดภัยอัตโนมัติเมื่อเป็น production/HTTPS
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
