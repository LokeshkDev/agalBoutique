import { pool, isConnected } from "../config/db.js";
import { seedCategories } from "../seed/seedData.js";

// GET /api/categories
export async function getCategories(req, res) {
  try {
    if (!pool || !isConnected) {
      return res.json({ success: true, categories: seedCategories });
    }

    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("Error in getCategories:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
}

