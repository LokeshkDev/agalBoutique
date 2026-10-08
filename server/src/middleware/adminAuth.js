import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_agal_boutique_2026";

export function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.admin_token || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin authorization token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin session token" });
  }
}

