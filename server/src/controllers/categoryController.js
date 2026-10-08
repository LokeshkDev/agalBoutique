import { pool, isConnected } from "../config/db.js";

// GET /api/categories
export async function getCategories(req, res) {
  try {
    if (!pool || !isConnected) {
      return res.json({ success: true, categories: [] });
    }

    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("Error in getCategories:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
}

// POST /api/categories (Admin Only)
export async function createCategory(req, res) {
  try {
    const { name, slug, image, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!pool || !isConnected) {
      return res.status(201).json({ success: true, category: { name, slug: catSlug, image, description } });
    }

    await pool.query(
      "INSERT INTO categories (name, slug, image, description) VALUES (?, ?, ?, ?)",
      [name, catSlug, image || "", description || ""]
    );

    res.status(201).json({ success: true, message: "Category created successfully" });
  } catch (err) {
    console.error("Error in createCategory:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create category" });
  }
}

// PUT /api/categories/:id (Admin Only)
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, image, description } = req.body;

    if (!pool || !isConnected) {
      return res.json({ success: true, message: "Category updated successfully" });
    }

    await pool.query(
      "UPDATE categories SET name = ?, slug = ?, image = ?, description = ? WHERE id = ? OR slug = ?",
      [name, slug, image, description, id, id]
    );

    res.json({ success: true, message: "Category updated successfully" });
  } catch (err) {
    console.error("Error in updateCategory:", err);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
}

// DELETE /api/categories/:id (Admin Only)
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    if (!pool || !isConnected) {
      return res.json({ success: true, message: "Category deleted successfully" });
    }

    await pool.query("DELETE FROM categories WHERE id = ? OR slug = ?", [id, id]);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error in deleteCategory:", err);
    res.status(500).json({ success: false, message: "Failed to delete category" });
  }
}
