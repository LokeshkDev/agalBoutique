import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export const seedCategories = [
  { name: "Sarees", slug: "sarees", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", description: "Handwoven Kanchipuram, Banarasi & Daily Linen Sarees." },
  { name: "Kurtis", slug: "kurtis", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", description: "Cambric Cotton, Rayon & Festive Chanderi Kurtis." },
  { name: "Full Sets", slug: "full-sets", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", description: "Kurti Palazzo Dupatta Sets & Anarkali Suits." },
  { name: "Blouses", slug: "blouses", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", description: "Readymade & Custom Stitched Blouses from Tamil Nadu." },
  { name: "Lehengas", slug: "lehengas", image: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", description: "Bridal, Party Wear & Half Saree Sets." },
  { name: "Kidswear", slug: "kidswear", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", description: "Traditional Girls Pattu Pavadai & Festive Frocks." },
];

export const seedProducts = [
  {
    id: "saree-001",
    slug: "kanchipuram-silk-saree-maroon",
    name: "Kanchipuram Soft Silk Saree",
    category: "Sarees",
    description: "Pure soft silk saree with traditional zari pallu and zari borders. Handcrafted by master weavers in Kanchipuram, Tamil Nadu.",
    fabric: "Soft Silk with Gold Zari",
    care: "Dry clean only",
    occasion: ["Wedding", "Festive"],
    price: 4999,
    mrp: 8999,
    sizes: [{ label: "Free Size", stock: 10 }],
    images: [
      { url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80", alt: "Kanchipuram Maroon Silk Saree" },
      { url: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&q=80", alt: "Zari pallu detail shot" }
    ],
    rating: { avg: 4.8, count: 156 },
    isNew: true,
    isBestseller: true,
    colors: ["Maroon", "Royal Blue", "Emerald Green"]
  },
  {
    id: "kurti-001",
    slug: "floral-cotton-kurti",
    name: "Floral Cotton Kurti",
    category: "Kurtis",
    description: "Knee-length straight fit kurti featuring hand-block floral motifs on breathable cambric cotton. Finished with 3/4th sleeves for daily wear.",
    fabric: "100% Cambric Cotton",
    care: "Machine wash cold, dry in shade",
    occasion: ["Daily Wear", "Casual"],
    price: 799,
    mrp: 1499,
    sizes: [
      { label: "S", stock: 15 }, { label: "M", stock: 10 }, { label: "L", stock: 5 }, { label: "XL", stock: 2 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", alt: "Floral cotton kurti front view" },
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Close up of print details" }
    ],
    rating: { avg: 4.5, count: 120 },
    isNew: true,
    isBestseller: true,
    colors: ["Teal", "Maroon"]
  },
  {
    id: "blouse-001",
    slug: "readymade-silk-padded-blouse",
    name: "Readymade Silk Padded Blouse",
    category: "Blouses",
    description: "Padded brocade silk blouse with back hook closure and piping details. Eligible for custom size adjustments by master tailors.",
    fabric: "Brocade Silk & Cotton Lining",
    care: "Dry clean recommended",
    occasion: ["Festive", "Party Wear"],
    price: 799,
    mrp: 1499,
    sizes: [
      { label: "34", stock: 8 }, { label: "36", stock: 12 }, { label: "38", stock: 6 }, { label: "40", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80", alt: "Readymade Silk Blouse Front" }
    ],
    rating: { avg: 4.6, count: 94 },
    isNew: true,
    isBestseller: true,
    colors: ["Gold", "Red", "Green"]
  },
  {
    id: "set-001",
    slug: "cotton-palazzo-kurti-set",
    name: "Cotton Kurti Palazzo Dupatta Set",
    category: "Full Sets",
    description: "3-piece set comprising a straight printed kurti, matching flared palazzo pants, and lightweight Kota Doria dupatta.",
    fabric: "Pure Cotton & Kota Dupatta",
    care: "Gentle machine wash",
    occasion: ["Festive", "Office Wear"],
    price: 1499,
    mrp: 2999,
    sizes: [
      { label: "S", stock: 5 }, { label: "M", stock: 8 }, { label: "L", stock: 10 }, { label: "XL", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80", alt: "Cotton Kurti Palazzo Set" }
    ],
    rating: { avg: 4.7, count: 210 },
    isNew: false,
    isBestseller: true,
    colors: ["Pink", "Peach"]
  },
  {
    id: "lehenga-001",
    slug: "cotton-festive-half-saree-set",
    name: "Traditional South Indian Half Saree Set",
    category: "Lehengas",
    description: "Jacquard silk skirt paired with embellished blouse piece and sheer net dhavani dupatta. Ideal for festivals and family functions.",
    fabric: "Art Silk & Net Dhavani",
    care: "Dry clean only",
    occasion: ["Festive", "Traditional"],
    price: 2499,
    mrp: 4499,
    sizes: [{ label: "Free Size", stock: 6 }],
    images: [
      { url: "https://images.unsplash.com/photo-1583391733975-dd83a31c53d1?w=800&q=80", alt: "Traditional Half Saree Set" }
    ],
    rating: { avg: 4.9, count: 76 },
    isNew: true,
    isBestseller: true,
    colors: ["Yellow-Green", "Magenta-Gold"]
  },
  {
    id: "kids-001",
    slug: "girls-pattu-pavadai-set",
    name: "Girls Silk Pattu Pavadai Set",
    category: "Kidswear",
    description: "Traditional jacquard silk pavadai lehenga with contrast zardozi border and breathable 100% soft cotton lining inside.",
    fabric: "Art Silk with Cotton Lining",
    care: "Dry clean only",
    occasion: ["Festive", "Traditional"],
    price: 1499,
    mrp: 2999,
    sizes: [
      { label: "2-4Y", stock: 5 }, { label: "4-6Y", stock: 8 }, { label: "6-8Y", stock: 6 }, { label: "8-10Y", stock: 4 }
    ],
    images: [
      { url: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&q=80", alt: "Girls Pattu Pavadai Set" }
    ],
    rating: { avg: 4.9, count: 112 },
    isNew: true,
    isBestseller: true,
    colors: ["Green-Pink", "Blue-Yellow"]
  }
];

export async function runSeeder() {
  console.log("🌱 Running Agal Boutique Database Seeder...");

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "agal_boutique",
    });

    console.log("Connected to MySQL for seeding...");

    // Create Tables if not exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cat_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        description TEXT,
        fabric VARCHAR(255),
        care VARCHAR(255),
        occasion JSON,
        price DECIMAL(10, 2) NOT NULL,
        mrp DECIMAL(10, 2),
        sizes JSON,
        colors JSON,
        images JSON,
        rating_avg DECIMAL(3, 2) DEFAULT 0.00,
        rating_count INT DEFAULT 0,
        is_new TINYINT(1) DEFAULT 0,
        is_bestseller TINYINT(1) DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_prod_category (category_name),
        INDEX idx_prod_slug (slug),
        INDEX idx_prod_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NOT NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        shipping_address JSON NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        cod_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('online', 'cod') NOT NULL DEFAULT 'online',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        order_status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        items JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ord_number (order_number),
        INDEX idx_ord_phone (customer_phone),
        INDEX idx_ord_status (order_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✅ Database tables verified/created.");

    // Seed Admin user (Password: admin_secure_password_123)
    const adminUser = process.env.ADMIN_USERNAME || "admin";
    const adminPass = process.env.ADMIN_PASSWORD || "agalBout@2026";
    const passwordHash = await bcrypt.hash(adminPass, 10);

    await connection.query(
      `INSERT INTO admins (username, email, password_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [adminUser, "admin@agalboutique.com", passwordHash]
    );
    console.log(`✅ Default Admin Seeded (Username: ${adminUser})`);

    // Seed Categories
    for (const cat of seedCategories) {
      await connection.query(
        `INSERT INTO categories (name, slug, image, description)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), image=VALUES(image), description=VALUES(description)`,
        [cat.name, cat.slug, cat.image, cat.description]
      );
    }
    console.log(`✅ ${seedCategories.length} Categories Seeded`);

    // Seed Products
    for (const p of seedProducts) {
      await connection.query(
        `INSERT INTO products (id, slug, name, category_name, description, fabric, care, occasion, price, mrp, sizes, colors, images, rating_avg, rating_count, is_new, is_bestseller, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), mrp=VALUES(mrp), sizes=VALUES(sizes), colors=VALUES(colors), images=VALUES(images)`,
        [
          p.id,
          p.slug,
          p.name,
          p.category,
          p.description,
          p.fabric,
          p.care,
          JSON.stringify(p.occasion),
          p.price,
          p.mrp,
          JSON.stringify(p.sizes),
          JSON.stringify(p.colors),
          JSON.stringify(p.images),
          p.rating.avg,
          p.rating.count,
          p.isNew ? 1 : 0,
          p.isBestseller ? 1 : 0,
          1
        ]
      );
    }
    console.log(`✅ ${seedProducts.length} Products Seeded`);

    await connection.end();
    console.log("🎉 Seeding Completed Successfully!");
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
  }
}

if (process.argv[1]?.endsWith("seedData.js")) {
  runSeeder();
}

