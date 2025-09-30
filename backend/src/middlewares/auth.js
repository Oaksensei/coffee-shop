// backend/src/middlewares/auth.js
import jwt from "jsonwebtoken";

// JWT-based authentication middleware (for API tokens)
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "coffee-shop-jwt-secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
  }
};

// Middleware to check if user is authenticated via session
const sessionAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated via session
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }
};

export { authGuard, sessionAuth };
