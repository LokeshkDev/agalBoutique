import { pool, isConnected } from "../config/db.js";
import { seedProducts } from "../seed/seedData.js";

// Ensure subcategory column exists in remote MySQL products table
let isProductSchemaChecked = false;
async function ensureProductSchema() {
  if (isProductSchemaChecked || !pool || !isConnected) return;
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM products LIKE 'subcategory'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE products ADD COLUMN subcategory VARCHAR(255) DEFAULT NULL");
      console.log("[DB] Added subcategory column to products table");
    }
    isProductSchemaChecked = true;
  } catch (err) {
    console.error("[DB Schema Check] products subcategory column notice:", err.message);
  }
}

// GET /api/products
export async function getProducts(req, res) {
  try {
    await ensureProductSchema();

    const {
      category,
      subcategory,
      search,
      sort,
      fabric,
      size,
      minPrice,
      maxPrice,
      isNew,
      isBestseller,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!pool || !isConnected) {
      // Fallback in-memory filter when DB connection is not configured locally
      let filtered = [...seedProducts];
      if (category) {
        const catNorm = category.toLowerCase().replace(/[^a-z0-9]/g, "");
        filtered = filtered.filter((p) => {
          const pNorm = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return pNorm === catNorm || p.category?.toLowerCase() === category.toLowerCase();
        });
      }
      if (subcategory) {
        const subNorm = subcategory.toLowerCase().replace(/[^a-z0-9]/g, "");
        filtered = filtered.filter((p) => {
          const pNorm = (p.subcategory || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return pNorm === subNorm || p.subcategory?.toLowerCase() === subcategory.toLowerCase();
        });
      }
      if (fabric) {
        filtered = filtered.filter((p) =>
          p.fabric?.toLowerCase().includes(fabric.toLowerCase())
        );
      }
      if (size) {
        filtered = filtered.filter((p) =>
          Array.isArray(p.sizes) &&
          p.sizes.some(
            (s) =>
              (typeof s === "string" ? s : s?.label)?.toLowerCase() ===
              size.toLowerCase()
          )
        );
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.fabric?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.subcategory?.toLowerCase().includes(q)
        );
      }
      if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
      if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
      if (isNew === "true" || isNew === "1" || isNew === true) {
        filtered = filtered.filter((p) => Boolean(p.isNew));
      }
      if (isBestseller === "true" || isBestseller === "1" || isBestseller === true) {
        filtered = filtered.filter((p) => Boolean(p.isBestseller));
      }

      return res.json({
        success: true,
        count: filtered.length,
        total: filtered.length,
        page: parseInt(page),
        products: filtered.slice(offset, offset + parseInt(limit)),
      });
    }

    // Database SQL query construction
    let whereClause = "WHERE is_active = 1";
    const queryParams = [];

    if (category) {
      const cleanCat = category.trim();
      const spacedCat = cleanCat.replace(/-/g, " ");
      whereClause += ` AND (
        LOWER(category_name) = LOWER(?)
        OR LOWER(REPLACE(category_name, ' ', '-')) = LOWER(?)
        OR LOWER(category_name) IN (SELECT LOWER(name) FROM categories WHERE LOWER(slug) = LOWER(?) OR LOWER(name) = LOWER(?))
        OR LOWER(category_name) LIKE LOWER(?)
      )`;
      queryParams.push(cleanCat, cleanCat, cleanCat, cleanCat, `%${spacedCat}%`);
    }

    if (subcategory) {
      const cleanSub = subcategory.trim();
      const spacedSub = cleanSub.replace(/-/g, " ");
      whereClause += ` AND (
        LOWER(subcategory) = LOWER(?)
        OR LOWER(REPLACE(subcategory, ' ', '-')) = LOWER(?)
        OR LOWER(subcategory) LIKE LOWER(?)
      )`;
      queryParams.push(cleanSub, cleanSub, `%${spacedSub}%`);
    }

    if (fabric) {
      whereClause += " AND LOWER(fabric) LIKE LOWER(?)";
      queryParams.push(`%${fabric}%`);
    }

    if (size) {
      whereClause += " AND LOWER(sizes) LIKE LOWER(?)";
      queryParams.push(`%${size}%`);
    }

    if (search) {
      whereClause += " AND (name LIKE ? OR description LIKE ? OR fabric LIKE ? OR category_name LIKE ? OR subcategory LIKE ?)";
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (minPrice) {
      whereClause += " AND price >= ?";
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClause += " AND price <= ?";
      queryParams.push(parseFloat(maxPrice));
    }

    if (isNew === "true" || isNew === "1" || isNew === true) {
      whereClause += " AND is_new = 1";
    }

    if (isBestseller === "true" || isBestseller === "1" || isBestseller === true) {
      whereClause += " AND is_bestseller = 1";
    }

    let orderBy = "ORDER BY created_at DESC";
    if (sort === "price_asc") orderBy = "ORDER BY price ASC";
    if (sort === "price_desc") orderBy = "ORDER BY price DESC";
    if (sort === "rating") orderBy = "ORDER BY rating_avg DESC";
    if (sort === "discount") orderBy = "ORDER BY (mrp - price) DESC";

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      queryParams
    );
    const total = countResult[0]?.total || 0;

    const [rows] = await pool.query(
      `SELECT * FROM products ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(limit), offset]
    );

    const formattedProducts = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category_name,
      subcategory: r.subcategory || null,
      description: r.description,
      fabric: r.fabric,
      care: r.care,
      occasion: typeof r.occasion === "string" ? JSON.parse(r.occasion) : r.occasion,
      price: parseFloat(r.price),
      mrp: r.mrp ? parseFloat(r.mrp) : null,
      sizes: typeof r.sizes === "string" ? JSON.parse(r.sizes) : r.sizes,
      colors: typeof r.colors === "string" ? JSON.parse(r.colors) : r.colors,
      images: typeof r.images === "string" ? JSON.parse(r.images) : r.images,
      rating: { avg: parseFloat(r.rating_avg), count: r.rating_count },
      isNew: Boolean(r.is_new),
      isBestseller: Boolean(r.is_bestseller),
    }));

    res.json({
      success: true,
      count: formattedProducts.length,
      total,
      page: parseInt(page),
      products: formattedProducts,
    });
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

// GET /api/products/:slug
export async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (!pool || !isConnected) {
      const product = seedProducts.find((p) => p.slug === slug);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      return res.json({ success: true, product });
    }

    const [rows] = await pool.query(
      "SELECT * FROM products WHERE slug = ? AND is_active = 1 LIMIT 1",
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const r = rows[0];
    const product = {
      id: r.id,
      slug: r.slug,
      name: r.name,
      category: r.category_name,
      subcategory: r.subcategory || null,
      description: r.description,
      fabric: r.fabric,
      care: r.care,
      occasion: typeof r.occasion === "string" ? JSON.parse(r.occasion) : r.occasion,
      price: parseFloat(r.price),
      mrp: r.mrp ? parseFloat(r.mrp) : null,
      sizes: typeof r.sizes === "string" ? JSON.parse(r.sizes) : r.sizes,
      colors: typeof r.colors === "string" ? JSON.parse(r.colors) : r.colors,
      images: typeof r.images === "string" ? JSON.parse(r.images) : r.images,
      rating: { avg: parseFloat(r.rating_avg), count: r.rating_count },
      isNew: Boolean(r.is_new),
      isBestseller: Boolean(r.is_bestseller),
    };

    res.json({ success: true, product });
  } catch (err) {
    console.error("Error in getProductBySlug:", err);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}

// POST /api/products (Admin Only)
export async function createProduct(req, res) {
  try {
    const {
      name,
      slug,
      category,
      subcategory,
      description,
      fabric,
      care,
      occasion,
      price,
      mrp,
      sizes,
      colors,
      images,
      ratingAvg = 4.6,
      ratingCount = 94,
      isNew = false,
      isBestseller = false,
    } = req.body;

    const id = `prod-${Date.now()}`;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newProductObj = {
      id,
      slug: generatedSlug,
      name,
      category,
      subcategory: subcategory || null,
      description: description || "",
      fabric: fabric || "",
      care: care || "",
      occasion: occasion || [],
      price: parseFloat(price || 0),
      mrp: mrp ? parseFloat(mrp) : null,
      sizes: sizes || [],
      colors: colors || [],
      images: images || [],
      rating: { avg: parseFloat(ratingAvg || 4.6), count: parseInt(ratingCount || 94) },
      isNew: Boolean(isNew),
      isBestseller: Boolean(isBestseller),
    };

    // Always update in-memory array so product reflects instantly in fallbacks
    const existingIdx = seedProducts.findIndex((p) => p.id === id || p.slug === generatedSlug);
    if (existingIdx !== -1) {
      seedProducts[existingIdx] = newProductObj;
    } else {
      seedProducts.unshift(newProductObj);
    }

    if (pool && isConnected) {
      await pool.query(
        `INSERT INTO products (id, slug, name, category_name, subcategory, description, fabric, care, occasion, price, mrp, sizes, colors, images, rating_avg, rating_count, is_new, is_bestseller)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           slug = VALUES(slug),
           name = VALUES(name),
           category_name = VALUES(category_name),
           subcategory = VALUES(subcategory),
           description = VALUES(description),
           fabric = VALUES(fabric),
           care = VALUES(care),
           occasion = VALUES(occasion),
           price = VALUES(price),
           mrp = VALUES(mrp),
           sizes = VALUES(sizes),
           colors = VALUES(colors),
           images = VALUES(images),
           rating_avg = VALUES(rating_avg),
           rating_count = VALUES(rating_count),
           is_new = VALUES(is_new),
           is_bestseller = VALUES(is_bestseller)`,
        [
          id,
          generatedSlug,
          name,
          category,
          subcategory || null,
          description || "",
          fabric || "",
          care || "",
          JSON.stringify(occasion || []),
          parseFloat(price || 0),
          mrp ? parseFloat(mrp) : null,
          JSON.stringify(sizes || []),
          JSON.stringify(colors || []),
          JSON.stringify(images || []),
          parseFloat(ratingAvg || 4.6),
          parseInt(ratingCount || 94),
          isNew ? 1 : 0,
          isBestseller ? 1 : 0,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProductObj,
    });
  } catch (err) {
    console.error("Error in createProduct:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create product" });
  }
}

// PUT /api/products/:id (Admin Only)
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      category,
      subcategory,
      description,
      fabric,
      care,
      occasion,
      price,
      mrp,
      sizes,
      colors,
      images,
      ratingAvg,
      ratingCount,
      isNew,
      isBestseller,
      isActive = true,
    } = req.body;

    const updatedSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id);

    // Always update in-memory array so product reflects instantly in fallbacks
    const idx = seedProducts.findIndex((p) => p.id === id || p.slug === id);
    if (idx !== -1) {
      seedProducts[idx] = {
        ...seedProducts[idx],
        name: name || seedProducts[idx].name,
        slug: updatedSlug,
        category: category || seedProducts[idx].category,
        subcategory: subcategory !== undefined ? subcategory : seedProducts[idx].subcategory,
        description: description !== undefined ? description : seedProducts[idx].description,
        fabric: fabric !== undefined ? fabric : seedProducts[idx].fabric,
        care: care !== undefined ? care : seedProducts[idx].care,
        occasion: occasion || seedProducts[idx].occasion,
        price: price ? parseFloat(price) : seedProducts[idx].price,
        mrp: mrp !== undefined ? (mrp ? parseFloat(mrp) : null) : seedProducts[idx].mrp,
        sizes: sizes || seedProducts[idx].sizes,
        colors: colors || seedProducts[idx].colors,
        images: images || seedProducts[idx].images,
        rating: {
          avg: ratingAvg !== undefined ? parseFloat(ratingAvg) : seedProducts[idx].rating?.avg || 4.5,
          count: ratingCount !== undefined ? parseInt(ratingCount) : seedProducts[idx].rating?.count || 10,
        },
        isNew: isNew !== undefined ? Boolean(isNew) : seedProducts[idx].isNew,
        isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : seedProducts[idx].isBestseller,
      };
    }

    if (pool && isConnected) {
      await pool.query(
        `UPDATE products SET
          name = ?,
          slug = ?,
          category_name = ?,
          subcategory = ?,
          description = ?,
          fabric = ?,
          care = ?,
          occasion = ?,
          price = ?,
          mrp = ?,
          sizes = ?,
          colors = ?,
          images = ?,
          rating_avg = COALESCE(?, rating_avg),
          rating_count = COALESCE(?, rating_count),
          is_new = ?,
          is_bestseller = ?,
          is_active = ?
         WHERE id = ? OR slug = ?`,
        [
          name,
          updatedSlug,
          category,
          subcategory !== undefined ? subcategory : null,
          description || "",
          fabric || "",
          care || "",
          JSON.stringify(occasion || []),
          parseFloat(price || 0),
          mrp ? parseFloat(mrp) : null,
          JSON.stringify(sizes || []),
          JSON.stringify(colors || []),
          JSON.stringify(images || []),
          ratingAvg !== undefined ? parseFloat(ratingAvg) : null,
          ratingCount !== undefined ? parseInt(ratingCount) : null,
          isNew ? 1 : 0,
          isBestseller ? 1 : 0,
          isActive ? 1 : 0,
          id,
          id,
        ]
      );
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update product" });
  }
}

// DELETE /api/products/:id (Admin Only)
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (!pool || !isConnected) {
      const idx = seedProducts.findIndex((p) => p.id === id);
      if (idx !== -1) seedProducts.splice(idx, 1);
      return res.json({ success: true, message: "Product deleted successfully (in-memory)" });
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to delete product" });
  }
}

// POST /api/products/bulk-delete (Admin Only)
export async function bulkDeleteProducts(req, res) {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided" });
    }

    if (!pool || !isConnected) {
      for (const id of ids) {
        const idx = seedProducts.findIndex((p) => p.id === id);
        if (idx !== -1) seedProducts.splice(idx, 1);
      }
      return res.json({ success: true, message: `${ids.length} products deleted (in-memory)` });
    }

    await pool.query("DELETE FROM products WHERE id IN (?)", [ids]);
    res.json({ success: true, message: `${ids.length} products deleted successfully` });
  } catch (err) {
    console.error("Error in bulkDeleteProducts:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to bulk delete products" });
  }
}



