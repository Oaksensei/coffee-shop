// backend/src/utils/jwt.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "coffee-shop-jwt-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export { signToken, verifyToken };
