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

// 1) ตอบ OPTIONS ก่อนทุกอย่าง (กัน middleware อื่นยิงทิ้ง)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    // ตอบ header CORS ขั้นพื้นฐานให้ browser พอใจ
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // ถ้าใช้ cookie ค่อยเปลี่ยนเป็น true และใส่ origin ตรงโดเมน (ห้าม *)
    // res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

// 2) เปิด CORS แบบกว้างเพื่อทดสอบ (ผ่านให้ชัวร์ก่อน)
app.use(cors({
  origin: true,                // สะท้อน origin กลับไป
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false           // ถ้าไม่ได้ใช้คุกกี้/เซสชัน ให้ false ไปก่อน
}));

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
