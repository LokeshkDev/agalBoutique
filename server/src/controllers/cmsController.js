import { pool, isConnected } from "../config/db.js";

// Default CMS settings in case DB is uninitialized or offline
const defaultCmsSettings = {
  hero_banner: {
    title: "Grand Festive Collection 2026",
    subtitle: "Handcrafted Silk Sarees, Designer Kurtis & Bespoke Stitching",
    badge: "New Arrival 2026",
    banner_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80",
    button_text: "Explore Collection",
    button_link: "/shop",
  },
  announcement_bar: {
    text: "✨ Free Express Delivery across India on orders above ₹999 | Direct WhatsApp Support",
    enabled: true,
  },
  promo_banner: {
    title: "Bespoke Custom Stitching",
    subtitle: "Get your blouses & lehengas custom stitched by master tailors in Chennai",
    image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    button_text: "Book Custom Order",
    button_link: "/shop?category=blouses",
    enabled: true,
  },
  store_info: {
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "support@agalboutique.com",
    address: "124 Boutique Street, T. Nagar, Chennai, Tamil Nadu 600017",
  },
};

// Auto-create cms_settings table if needed
async function ensureCmsTable() {
  if (!pool || !isConnected) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cms_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default settings if empty
    for (const [key, val] of Object.entries(defaultCmsSettings)) {
      await pool.query(
        `INSERT IGNORE INTO cms_settings (setting_key, setting_value) VALUES (?, ?)`,
        [key, JSON.stringify(val)]
      );
    }
  } catch (err) {
    console.error("Error ensuring CMS table:", err);
  }
}

// GET /api/cms - Public endpoint to retrieve all CMS settings
export async function getCmsSettings(req, res) {
  try {
    if (!pool || !isConnected) {
      return res.json({
        success: true,
        settings: defaultCmsSettings,
      });
    }

    await ensureCmsTable();

    const [rows] = await pool.query("SELECT * FROM cms_settings");
    const settings = { ...defaultCmsSettings };

    for (const row of rows) {
      try {
        settings[row.setting_key] = typeof row.setting_value === "string"
          ? JSON.parse(row.setting_value)
          : row.setting_value;
      } catch (e) {
        settings[row.setting_key] = row.setting_value;
      }
    }

    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error in getCmsSettings:", err);
    res.json({ success: true, settings: defaultCmsSettings });
  }
}

// PUT /api/admin/cms - Admin endpoint to update CMS settings
export async function updateCmsSettings(req, res) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: "Setting key and value are required" });
    }

    if (!pool || !isConnected) {
      defaultCmsSettings[key] = value;
      return res.json({ success: true, message: "CMS setting updated (in-memory)", key, value });
    }

    await ensureCmsTable();

    await pool.query(
      `INSERT INTO cms_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, JSON.stringify(value)]
    );

    res.json({ success: true, message: `CMS setting '${key}' updated successfully` });
  } catch (err) {
    console.error("Error in updateCmsSettings:", err);
    res.status(500).json({ success: false, message: "Failed to update CMS setting" });
  }
}

