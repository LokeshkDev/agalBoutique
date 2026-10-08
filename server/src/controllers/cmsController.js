import { pool, isConnected } from "../config/db.js";

// Default CMS settings stored in DB
const defaultCmsSettings = {
  hero_slides: [
    {
      id: 1,
      title: "Grand Festive Handloom Mela",
      subtitle: "Pure Kanchipuram Silks, Cambric Cotton Kurtis & Suits",
      offer: "Flat 15% OFF with Code FESTIVE15 · Free Delivery Across India",
      link: "/shop?category=sarees",
      cta: "Shop Festive Edit",
      badge: "Festive Exclusive",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
    },
    {
      id: 2,
      title: "3–5 Days Custom Blouse Stitching",
      subtitle: "Send measurements on WhatsApp or pick standard sizes",
      offer: "Master Craftsmanship from Tamil Nadu · Free Alteration Guarantee",
      link: "/shop?category=blouses",
      cta: "Explore Blouse Styles",
      badge: "Bespoke Tailoring",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
    },
    {
      id: 3,
      title: "Pure Cotton Kurtis & Full Sets",
      subtitle: "Breathable cambric cottons, straight cuts & festive Anarkalis",
      offer: "Daily Wear & Office Styles starting from ₹699",
      link: "/shop?category=kurtis",
      cta: "Shop Kurtis & Sets",
      badge: "Trending Daily Wear",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
    },
  ],
  announcement_bar: {
    text: "✨ Free Express Delivery across India on orders above ₹999 | Direct WhatsApp Support",
    enabled: true,
  },
  testimonials: [
    {
      id: 1,
      name: "Priya Sundaram",
      location: "Chennai, Tamil Nadu",
      rating: 5,
      tag: "Custom Blouse Stitching",
      date: "Verified Buyer",
      review: "Ordered custom blouse stitching for my Kanchipuram silk saree. The fit was 100% accurate to the measurements I sent on WhatsApp! The neck piping and dori work were so neat.",
    },
    {
      id: 2,
      name: "Kavitha Rangarajan",
      location: "Coimbatore, Tamil Nadu",
      rating: 5,
      tag: "Pure Cotton Kurti Set",
      date: "Verified Buyer",
      review: "The cambric cotton fabric is exceptionally soft and breathable for daily office wear. Delivery reached Coimbatore in just 2 days.",
    },
    {
      id: 3,
      name: "Ananya Deshmukh",
      location: "Bengaluru, Karnataka",
      rating: 5,
      tag: "Festive Silk Anarkali",
      date: "Verified Buyer",
      review: "Received so many compliments at my cousin's sangeet! The zari border on the dupatta looks rich and royal.",
    },
  ],
  store_info: {
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "support@agalboutique.com",
    address: "124 Boutique Street, T. Nagar, Chennai, Tamil Nadu 600017",
  },
  about_cms: {
    hero_title: "Handcrafted Elegance & Timeless Tamil Heritage",
    hero_subtitle: "Bridging centuries of Indian handloom weaving with modern boutique tailoring.",
    hero_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
    story_headline: "Our Story: Rooted in Tamil Nadu's Weaving Heartlands",
    story_text: "Agal Boutique was founded with a passion to honor traditional Indian handlooms while offering contemporary women effortless elegance. Every piece in our collection is woven by master artisans across Kanchipuram, Coimbatore, and Madurai, then custom-fitted by our master tailors.",
    story_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    cards: [
      {
        title: "100% Authentic Handlooms",
        text: "Directly sourced from weaver cooperatives in Kanchipuram & Chettinad.",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
      },
      {
        title: "Custom Stitching Studio",
        text: "Bespoke blouse & saree tailoring dispatched in 3–5 days with free adjustment guarantee.",
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
      },
      {
        title: "Sustainable Crafts",
        text: "Eco-friendly natural dyes, cambric cottons, and fair-wage artisan support.",
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
      },
    ],
  },
  contact_cms: {
    title: "Visit Our Boutique or Get in Touch",
    subtitle: "We're here to assist you with orders, custom stitching, or styling queries.",
    whatsapp: "+91 98765 43210",
    phone: "+91 98765 43210",
    email: "support@agalboutique.com",
    address: "124 Boutique Street, Opp. Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017",
    hours: "Monday – Saturday: 10:00 AM – 9:00 PM | Sunday: 11:00 AM – 7:00 PM",
    map_url: "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed",
    banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
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
