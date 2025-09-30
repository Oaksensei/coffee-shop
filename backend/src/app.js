import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import cookieParser from "cookie-parser";

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

// Security headers
app.use(helmet());

// CORS - อนุญาตทุก origin ชั่วคราว
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Session
app.set("trust proxy", 1);
app.use(session({
  secret: process.env.SESSION_SECRET || "change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

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