import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool, isConnected } from "../config/db.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_agal_boutique_2026";
const ADMIN_USER = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin_secure_password_123";

// POST /api/admin/login
export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and password required" });
    }

    let isValid = false;
    let adminEmail = "admin@agalboutique.com";

    if (pool && isConnected) {
      const [rows] = await pool.query(
        "SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1",
        [username, username]
      );
      if (rows.length > 0) {
        const adminRecord = rows[0];
        isValid = await bcrypt.compare(password, adminRecord.password_hash);
        adminEmail = adminRecord.email;
      }
    } else {
      // Dev mode fallback matching default env credentials
      if (
        (username === ADMIN_USER || username === "admin@agalboutique.com") &&
        (password === ADMIN_PASS || password === "admin_secure_password_123")
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { username, role: "admin", email: adminEmail },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { username, email: adminEmail, role: "admin" },
    });
  } catch (err) {
    console.error("Error in adminLogin:", err);
    res.status(500).json({ success: false, message: "Server error during admin login" });
  }
}

// GET /api/admin/me
export async function getAdminMe(req, res) {
  res.json({
    success: true,
    admin: req.admin,
  });
}

// POST /api/admin/logout
export async function adminLogout(req, res) {
  res.clearCookie("admin_token");
  res.json({ success: true, message: "Logged out successfully" });
}

