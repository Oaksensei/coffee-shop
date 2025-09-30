import bcrypt from "bcryptjs";
import db from "../db.js";
import { signToken } from "../utils/jwt.js";

// นับความพยายาม login แบบ in-memory (ง่าย ๆ)
const attempts = new Map(); // key=username, value={ count, last }

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ ok: false, error: "VALIDATION_ERROR", message: "username/password required" });
  }

  // brute-force throttle: ถ้าผิดเกิน 5 ครั้งใน 10 นาที หน่วง 2s
  const a = attempts.get(username) || { count: 0, last: 0 };
  if (a.count >= 5 && Date.now() - a.last < 10 * 60 * 1000) {
    await delay(2000);
  }

  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.password_hash, u.full_name, u.is_active, r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       WHERE u.username = ? AND u.deleted_at IS NULL LIMIT 1`,
      [username]
    );
    const user = rows[0];
    if (!user) {
      attempts.set(username, { count: a.count + 1, last: Date.now() });
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }
    if (!user.is_active) {
      return res.status(403).json({ ok: false, error: "INACTIVE" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      attempts.set(username, { count: a.count + 1, last: Date.now() });
      return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
    }
    attempts.delete(username);

    const token = signToken({ id: user.id, role: user.role, username: user.username });
    return res.json({
      ok: true,
      data: {
        token,
        user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
}

async function me(req, res) {
  // req.user มาจาก authGuard
  return res.json({ ok: true, data: req.user });
}

export { login, me };
