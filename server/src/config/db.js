import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "agal_boutique",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} catch (err) {
  console.warn("⚠️ MySQL pool creation error:", err.message);
}

export async function testConnection() {
  if (!pool) {
    console.warn("⚠️ MySQL Database pool not initialized.");
    return false;
  }
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database successfully!");
    connection.release();
    isConnected = true;
    return true;
  } catch (err) {
    console.warn("⚠️ MySQL Connection Failed:", err.message);
    console.warn("📌 Tip: Set correct DB credentials in server/.env or Lightsail MySQL instance.");
    isConnected = false;
    return false;
  }
}

export { pool, isConnected };

