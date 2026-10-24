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
      title: "Plus Size Varieties (M to 7XL)",
      subtitle: "Western wear, festival collections & tops with dupatta",
      offer: "100+ Unique Varieties · Premium Quality Fabrics",
      link: "/shop",
      cta: "Explore Plus Size",
      badge: "Plus Size Specialist",
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
      tag: "Plus Size Anarkali Set (5XL)",
      date: "Verified Buyer",
      review: "Finding authentic 5XL plus size festive sets was impossible until I found Agal Boutique! The fit is perfect, fabric quality is pure luxury, and the dupatta length is generous.",
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
    phone: "+91 63795 89711",
    whatsapp: "+91 63795 89711",
    email: "support@agalboutique.com",
    address: "124 Boutique Street, T. Nagar, Chennai, Tamil Nadu 600017",
  },
  about_cms: {
    hero_title: "Handcrafted Elegance & Timeless Tamil Heritage",
    hero_subtitle: "Specialized in plus size varieties (M to 7XL), premium quality fabrics, western wear and festival collections.",
    hero_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
    story_headline: "Our Story: Rooted in Tamil Nadu's Weaving Heartlands",
    story_text: "Agal Boutique was founded with a passion to honor traditional Indian handlooms while offering contemporary women effortless elegance in plus size fashion. Every piece in our collection is crafted with premium fabrics and generous fits across sizes M to 7XL.",
    story_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    cards: [
      {
        title: "100% Authentic Handlooms",
        text: "Directly sourced from weaver cooperatives in Kanchipuram & Chettinad.",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
      },
      {
        title: "Plus Size Specialist (M–7XL)",
        text: "Comfort-first silhouettes with generous cuts, breathable linings, and flattering draping.",
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
    subtitle: "We're here to assist you with orders, plus size sizing, or styling queries.",
    whatsapp: "+91 63795 89711",
    phone: "+91 63795 89711",
    email: "support@agalboutique.com",
    address: "124 Boutique Street, Opp. Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017",
    hours: "Monday – Saturday: 10:00 AM – 9:00 PM | Sunday: 11:00 AM – 7:00 PM",
    map_url: "https://maps.google.com/maps?q=T.+Nagar,+Chennai&t=&z=13&ie=UTF8&iwloc=&output=embed",
    banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  },
  policy_pages: {
    terms: {
      title: "Terms and Conditions",
      subtitle: "Please review our terms of service, boutique policies, and order agreements.",
      banner_image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80",
      content: `Welcome to Agal Boutique. By accessing or shopping on our website (agalboutique.com), you agree to comply with and be bound by the following terms and conditions.

1. Product Authenticity & Handcrafted Variation
All sarees, kurtis, 2-piece sets, 3-piece full sets, and ethnic wear are handcrafted with premium fabrics. Due to authentic handloom weaving and artisan dying processes, minor variations in weave texture, motifs, and shade are characteristic of handloom authenticity and not considered defects.

2. Plus Size Sizing (M to 7XL)
We specialize in plus size varieties from M to 7XL. Please refer to our detailed size chart before ordering. For any sizing guidance or assistance, reach out to our team via WhatsApp.

3. Pricing & Taxes
All listed prices are in Indian Rupees (INR) and are inclusive of applicable GST unless explicitly stated otherwise. Delivery and shipping charges are calculated at checkout based on chosen payment method and order value.

4. Orders & Cancellations
Orders can be canceled within 12 hours of placement or prior to dispatch, whichever is earlier. Once an order has been dispatched, standard refund and exchange policies apply.

5. Delivery & Transit
We partner with premier courier services across India. Normal delivery transit is 3-5 business days across Tamil Nadu & major metropolitan cities, and 4-7 business days for other regional areas. Agal Boutique is not liable for force majeure transit delays.`,
      updated_at: "October 2026",
    },
    refund: {
      title: "Refund & Exchange Policy",
      subtitle: "Our commitment to hassle-free 7-day returns, size exchanges, and customer satisfaction.",
      banner_image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
      content: `At Agal Boutique, your complete satisfaction with your ethnic wear is our utmost priority. We offer a transparent, customer-friendly 7-day return and exchange policy.

1. 7-Day Hassle-Free Returns & Size Exchanges
If you are not fully satisfied with your purchase or require a different size (sizes M to 7XL available), you may request a return or size exchange within 7 days of receiving your parcel.

2. Eligibility Conditions
• The garment must be unworn, unwashed, unaltered, and undamaged.
• Original price tags, brand labels, and boutique packaging must be intact.
• Products bought during clearance blowout sales are eligible for size exchange or store credit.

3. Process for Exchange / Return
To initiate a return or exchange:
• WhatsApp our customer care team at +91 63795 89711 with your Order ID and photos of the garment.
• Our team will arrange a reverse pickup from your doorstep or provide shipping instructions.

4. Refund Timelines
Once your returned parcel is received and inspected at our Chennai boutique studio:
• Online Payments: Refund will be processed back to the original source account (UPI / Bank / Card) within 3–5 working days.
• Cash on Delivery (COD): Refund will be transferred directly to your bank account or Google Pay / PhonePe UPI ID within 24–48 hours of verification.`,
      updated_at: "October 2026",
    },
    privacy: {
      title: "Privacy Policy",
      subtitle: "How Agal Boutique protects your personal information, contact details, and transactions.",
      banner_image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&q=80",
      content: `Agal Boutique is committed to respecting and protecting the privacy of our esteemed customers. This Privacy Policy outlines our data handling practices.

1. Information We Collect
We collect necessary details required to deliver your orders and provide personalized styling support:
• Contact Information: Full name, phone/WhatsApp number, delivery address, city, state, pin code, and email address.
• Sizing & Fitting Preferences: Selected dress sizes (M to 7XL) and preferred styles.
• Transaction History: Order details, invoice references, and chosen payment methods (Online Payment / Cash on Delivery). Note: We DO NOT store your card numbers or UPI PINs; all online transactions are securely encrypted by RBI-regulated payment gateways.

2. How We Use Your Information
• Processing, packaging, and dispatching your orders.
• Sending order status notifications and tax invoices directly to your phone via WhatsApp / SMS.
• Providing 1-on-1 boutique customer service and size advice.

3. Data Protection & Sharing
We never sell, rent, or trade your personal data with third-party advertising companies. Your details are shared solely with logistics partners (e.g., courier services) strictly to ensure safe delivery of your parcel.

4. Contact Our Data Protection Team
If you have any questions regarding your data or wish to update your details, contact us anytime at care@agalboutique.com or WhatsApp +91 63795 89711.`,
      updated_at: "October 2026",
    },
  },
  delivery_settings: {
    standardFee: 79,
    freeThreshold: 999,
    estimateDays: "3-5 Business Days",
    online: {
      firstItemFee: 79,
      additionalItemFee: 25,
      freeThreshold: 999,
      estimateDays: "3-5 Business Days",
    },
    cod: {
      firstItemFee: 99,
      additionalItemFee: 35,
      freeThreshold: 1499,
      estimateDays: "4-7 Business Days",
      enabled: true,
    },
  },
  header_quick_menu: [
    { id: "1", title: "All Collections", url: "/shop" },
    { id: "2", title: "Sarees", url: "/shop?category=sarees" },
    { id: "3", title: "Kurtis", url: "/shop?category=kurtis" },
    { id: "4", title: "Full Sets", url: "/shop?category=full-sets" },
    { id: "5", title: "About Us", url: "/about" },
    { id: "6", title: "Contact", url: "/contact" },
  ],
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

    // Clean up deprecated header_nav_menu from db & tables if existing
    try {
      await pool.query(`DROP TABLE IF EXISTS header_nav_menu, header_navigation, header_menus;`);
      await pool.query(`DELETE FROM cms_settings WHERE setting_key = 'header_nav_menu';`);
    } catch (e) {}

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
