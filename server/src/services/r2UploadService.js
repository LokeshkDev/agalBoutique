import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3Client for Cloudflare R2
function getR2Client() {
  dotenv.config();
  let accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();

  // Sanitize accountId in case full URL was passed in .env
  accountId = accountId
    .replace(/^https?:\/\//, "")
    .replace(/\.r2\.cloudflarestorage\.com.*$/, "")
    .replace(/\/$/, "");

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    accountId.includes("your_") ||
    accessKeyId.includes("your_") ||
    secretAccessKey.includes("your_") ||
    accountId.includes("placeholder") ||
    accountId.length !== 32
  ) {
    if (accountId && accountId.length !== 32 && !accountId.includes("your_")) {
      console.warn(`[R2 Warning] R2_ACCOUNT_ID length is ${accountId.length} chars (expected 32 hex chars). Falling back to local storage.`);
    }
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
 * @returns {Promise<{ url: string, originalSizeKb: number, optimizedSizeKb: number }>}
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
  const bucketName = process.env.R2_BUCKET_NAME || "agalboutique";
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").trim();
  const isPublicDomainValid = publicDomain && !publicDomain.includes("xxxxxx") && !publicDomain.includes("your_");

  // 2. Upload to Cloudflare R2 if valid credentials exist
  if (r2Client && isPublicDomainValid) {
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
      console.error("Cloudflare R2 Upload Error, falling back to local storage:", err.message);
    }
  }

  // 3. Fallback to local uploads folder if R2 credentials are not set or invalid
  const publicDir = path.join(__dirname, "../../public/uploads");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, filename);
  fs.writeFileSync(filePath, optimizedBuffer);

  const serverBaseUrl = (process.env.BACKEND_URL || process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");
  const localUrl = `${serverBaseUrl}/uploads/${filename}`;

  return {
    url: localUrl,
    originalSizeKb,
    optimizedSizeKb,
    storage: "Local Storage Fallback",
  };
}

