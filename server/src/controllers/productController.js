import { pool, isConnected } from "../config/db.js";
import { seedProducts } from "../seed/seedData.js";

// GET /api/products
export async function getProducts(req, res) {
  try {
    const {
      category,
      search,
      sort,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!pool || !isConnected) {
      // Fallback in-memory filter when DB connection is not configured locally
      let filtered = [...seedProducts];
      if (category) {
        filtered = filtered.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.fabric.toLowerCase().includes(q)
        );
      }
      if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
      if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);

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
      whereClause += " AND LOWER(category_name) = LOWER(?)";
      queryParams.push(category);
    }

    if (search) {
      whereClause += " AND (name LIKE ? OR description LIKE ? OR fabric LIKE ?)";
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (minPrice) {
      whereClause += " AND price >= ?";
      queryParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereClause += " AND price <= ?";
      queryParams.push(parseFloat(maxPrice));
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

    if (!pool || !isConnected) {
      const newProduct = {
        id,
        slug: generatedSlug,
        name,
        category,
        description,
        fabric,
        care,
        occasion: occasion || [],
        price: parseFloat(price),
        mrp: mrp ? parseFloat(mrp) : null,
        sizes: sizes || [],
        colors: colors || [],
        images: images || [],
        rating: { avg: parseFloat(ratingAvg), count: parseInt(ratingCount) },
        isNew: Boolean(isNew),
        isBestseller: Boolean(isBestseller),
      };
      seedProducts.push(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    }

    await pool.query(
      `INSERT INTO products (id, slug, name, category_name, description, fabric, care, occasion, price, mrp, sizes, colors, images, rating_avg, rating_count, is_new, is_bestseller)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        generatedSlug,
        name,
        category,
        description,
        fabric,
        care,
        JSON.stringify(occasion || []),
        price,
        mrp || null,
        JSON.stringify(sizes || []),
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        parseFloat(ratingAvg),
        parseInt(ratingCount),
        isNew ? 1 : 0,
        isBestseller ? 1 : 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: { id, slug: generatedSlug, name, category, price },
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

    if (!pool || !isConnected) {
      const idx = seedProducts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        seedProducts[idx] = {
          ...seedProducts[idx],
          name: name || seedProducts[idx].name,
          slug: slug || seedProducts[idx].slug,
          category: category || seedProducts[idx].category,
          description: description || seedProducts[idx].description,
          fabric: fabric || seedProducts[idx].fabric,
          care: care || seedProducts[idx].care,
          price: price ? parseFloat(price) : seedProducts[idx].price,
          mrp: mrp ? parseFloat(mrp) : seedProducts[idx].mrp,
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
      return res.json({ success: true, message: "Product updated successfully (in-memory)" });
    }

    await pool.query(
      `UPDATE products SET
        name = ?,
        slug = ?,
        category_name = ?,
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
       WHERE id = ?`,
      [
        name,
        slug,
        category,
        description,
        fabric,
        care,
        JSON.stringify(occasion || []),
        price,
        mrp || null,
        JSON.stringify(sizes || []),
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        ratingAvg !== undefined ? parseFloat(ratingAvg) : null,
        ratingCount !== undefined ? parseInt(ratingCount) : null,
        isNew ? 1 : 0,
        isBestseller ? 1 : 0,
        isActive ? 1 : 0,
        id,
      ]
    );

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



