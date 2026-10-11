import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded regardless of current working directory
const envLocations = [
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
];
for (const envPath of envLocations) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// Built-in Agal Boutique Cloudflare R2 credentials (guarantees production uploads never fail even if hosting dashboard env was missed)
const R2_CONFIG = {
  accountId: "6fe2361275ece85111f15edddce8cd87",
  accessKeyId: "cf87e251b0604edfd5552214e46f4cd1",
  secretAccessKey: "d152f63560c6dbe225027a7be38388397281107b5da3e664af33116740f5515c",
  bucketName: "agalboutique",
  publicDomain: "https://pub-392d2e841ea042c7962ed83ddd3d4ad5.r2.dev",
};

// Initialize S3Client for Cloudflare R2
function getR2Client() {
  let accountId = (process.env.R2_ACCOUNT_ID || R2_CONFIG.accountId).trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || R2_CONFIG.accessKeyId).trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || R2_CONFIG.secretAccessKey).trim();

  // Sanitize accountId in case full URL was passed in .env
  accountId = accountId
    .replace(/^https?:\/\//, "")
    .replace(/\.r2\.cloudflarestorage\.com.*$/, "")
    .replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Optimize image buffer (MB -> KB conversion using Sharp WebP) and upload to Cloudflare R2
 * @param {Buffer} buffer - Original image buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<{ url: string, originalSizeKb: number, optimizedSizeKb: number, storage: string }>}
 */
export async function optimizeAndUploadImage(buffer, originalName = "image.jpg") {
  const originalSizeKb = Math.round(buffer.length / 1024);

  // 1. Optimize Image using Sharp: Resize to max 1600px, compress to WebP with 80% quality
  const optimizedBuffer = await sharp(buffer)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  const optimizedSizeKb = Math.round(optimizedBuffer.length / 1024);
  console.log(`[Image Optimization] Reduced ${originalName} from ${originalSizeKb} KB -> ${optimizedSizeKb} KB WebP`);

  const filename = `${Date.now()}-${path.parse(originalName).name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.webp`;
  const key = `uploads/${filename}`;

  const r2Client = getR2Client();
  const bucketName = (process.env.R2_BUCKET_NAME || R2_CONFIG.bucketName).trim();
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || R2_CONFIG.publicDomain).trim();

  // 2. Upload to Cloudflare R2
  if (r2Client) {
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: optimizedBuffer,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const cleanDomain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
      const publicUrl = `${cleanDomain}/${key}`;
      console.log(`[Cloudflare R2] Successfully uploaded ${key} -> ${publicUrl}`);

      return {
        url: publicUrl,
        originalSizeKb,
        optimizedSizeKb,
        storage: "Cloudflare R2",
      };
    } catch (err) {
      console.error("[Cloudflare R2 Upload Error]:", err.message, "Attempting retry...");
      try {
        await r2Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: optimizedBuffer,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
        const cleanDomain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
        const publicUrl = `${cleanDomain}/${key}`;
        return {
          url: publicUrl,
          originalSizeKb,
          optimizedSizeKb,
          storage: "Cloudflare R2",
        };
      } catch (retryErr) {
        console.error("[Cloudflare R2 Retry Failed]:", retryErr.message);
      }
    }
  }

  // 3. Fallback to local uploads folder only if R2 is strictly unreachable
  const publicDir = path.join(__dirname, "../../public/uploads");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, filename);
  fs.writeFileSync(filePath, optimizedBuffer);

  const serverBase = (process.env.BACKEND_URL || process.env.SERVER_URL || "").replace(/\/$/, "");
  const localUrl = serverBase ? `${serverBase}/uploads/${filename}` : `/uploads/${filename}`;

  return {
    url: localUrl,
    originalSizeKb,
    optimizedSizeKb,
    storage: "Local Storage Fallback",
  };
}

