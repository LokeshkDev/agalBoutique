import { pool, isConnected } from "../config/db.js";

let categorySchemaEnsured = false;
async function ensureCategorySchema() {
  if (categorySchemaEnsured || !pool || !isConnected) return;
  try {
    await pool.query("ALTER TABLE categories ADD COLUMN subcategories JSON DEFAULT NULL");
  } catch (e) {}
  categorySchemaEnsured = true;
}

// GET /api/categories
export async function getCategories(req, res) {
  try {
    await ensureCategorySchema();
    if (!pool || !isConnected) {
      return res.json({ success: true, categories: [] });
    }

    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    const formatted = rows.map((r) => {
      let subcats = [];
      try {
        subcats = typeof r.subcategories === "string" ? JSON.parse(r.subcategories) : (r.subcategories || []);
      } catch (e) {
        subcats = [];
      }
      return {
        ...r,
        subcategories: Array.isArray(subcats) ? subcats : [],
      };
    });
    res.json({ success: true, categories: formatted });
  } catch (err) {
    console.error("Error in getCategories:", err);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
}

// POST /api/categories (Admin Only)
export async function createCategory(req, res) {
  try {
    await ensureCategorySchema();
    const { name, slug, image, description, subcategories = [] } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const subcatsJson = JSON.stringify(Array.isArray(subcategories) ? subcategories : (typeof subcategories === "string" ? subcategories.split(",").map(s => s.trim()).filter(Boolean) : []));

    if (!pool || !isConnected) {
      return res.status(201).json({ success: true, category: { name, slug: catSlug, image, description, subcategories } });
    }

    await pool.query(
      "INSERT INTO categories (name, slug, image, description, subcategories) VALUES (?, ?, ?, ?, ?)",
      [name, catSlug, image || "", description || "", subcatsJson]
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
    await ensureCategorySchema();
    const { id } = req.params;
    const { name, slug, image, description, subcategories = [] } = req.body;
    const subcatsJson = JSON.stringify(Array.isArray(subcategories) ? subcategories : (typeof subcategories === "string" ? subcategories.split(",").map(s => s.trim()).filter(Boolean) : []));

    if (!pool || !isConnected) {
      return res.json({ success: true, message: "Category updated successfully" });
    }

    await pool.query(
      "UPDATE categories SET name = ?, slug = ?, image = ?, description = ?, subcategories = ? WHERE id = ? OR slug = ?",
      [name, slug, image, description, subcatsJson, id, id]
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
