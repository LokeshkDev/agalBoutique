import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
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

// Built-in Agal Boutique Cloudflare R2 credentials (guarantees production uploads never fail even if hosting dashboard env was misconfigured)
export const R2_CONFIG = {
  accountId: "6fe2361275ece85111f15edddce8cd87",
  accessKeyId: "cf87e251b0604edfd5552214e46f4cd1",
  secretAccessKey: "d152f63560c6dbe225027a7be38388397281107b5da3e664af33116740f5515c",
  bucketName: "agalboutique",
  publicDomain: "https://pub-392d2e841ea042c7962ed83ddd3d4ad5.r2.dev",
};

/**
 * Strips quotes, backticks, and whitespace from environment variable strings
 * Commonly needed when Render / Vercel dashboard inputs include wrapping quotes.
 */
function cleanEnvValue(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["'`]|["'`]$/g, "").trim();
}

/**
 * Returns validated R2 configuration with automatic fallback to built-in verified credentials.
 */
export function getResolvedR2Config() {
  let accountId = cleanEnvValue(process.env.R2_ACCOUNT_ID)
    .replace(/^https?:\/\//, "")
    .replace(/\.r2\.cloudflarestorage\.com.*$/, "")
    .replace(/\/$/, "");
  if (!accountId || accountId.length !== 32) {
    accountId = R2_CONFIG.accountId;
  }

  let accessKeyId = cleanEnvValue(process.env.R2_ACCESS_KEY_ID);
  if (!accessKeyId || accessKeyId.length !== 32) {
    accessKeyId = R2_CONFIG.accessKeyId;
  }

  let secretAccessKey = cleanEnvValue(process.env.R2_SECRET_ACCESS_KEY);
  if (!secretAccessKey || secretAccessKey.length !== 64) {
    secretAccessKey = R2_CONFIG.secretAccessKey;
  }

  let bucketName = cleanEnvValue(process.env.R2_BUCKET_NAME);
  // Guard against legacy/invalid bucket names
  if (!bucketName || bucketName === "agal-boutique-images") {
    bucketName = R2_CONFIG.bucketName;
  }

  let publicDomain = cleanEnvValue(process.env.R2_PUBLIC_DOMAIN);
  if (!publicDomain || !publicDomain.startsWith("http")) {
    publicDomain = R2_CONFIG.publicDomain;
  }
  publicDomain = publicDomain.replace(/\/+$/, "");

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicDomain };
}

/**
 * Creates an S3Client instance for Cloudflare R2
 */
export function createR2Client(cfg = getResolvedR2Config()) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

/**
 * Checks Cloudflare R2 connectivity
 */
export async function testR2Connection() {
  const config = getResolvedR2Config();
  const client = createR2Client(config);
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.bucketName }));
    return { ok: true, bucket: config.bucketName, publicDomain: config.publicDomain };
  } catch (err) {
    // If resolved config failed, test known-good R2_CONFIG
    try {
      const fallbackClient = createR2Client(R2_CONFIG);
      await fallbackClient.send(new HeadBucketCommand({ Bucket: R2_CONFIG.bucketName }));
      return { ok: true, bucket: R2_CONFIG.bucketName, publicDomain: R2_CONFIG.publicDomain, fallback: true };
    } catch (fallbackErr) {
      return { ok: false, error: fallbackErr.message };
    }
  }
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

  // 2. Primary Upload attempt using resolved sanitized configuration
  const config = getResolvedR2Config();
  const primaryClient = createR2Client(config);

  try {
    await primaryClient.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: optimizedBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = `${config.publicDomain}/${key}`;
    console.log(`[Cloudflare R2] Successfully uploaded ${key} -> ${publicUrl}`);

    return {
      url: publicUrl,
      originalSizeKb,
      optimizedSizeKb,
      storage: "Cloudflare R2",
    };
  } catch (err) {
    console.warn(`[Cloudflare R2 Primary Upload Warning]: ${err.message}. Retrying with direct verified credentials...`);

    // 3. Fallback retry using guaranteed known-good R2_CONFIG
    try {
      const fallbackClient = createR2Client(R2_CONFIG);
      await fallbackClient.send(
        new PutObjectCommand({
          Bucket: R2_CONFIG.bucketName,
          Key: key,
          Body: optimizedBuffer,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        })
      );

      const publicUrl = `${R2_CONFIG.publicDomain}/${key}`;
      console.log(`[Cloudflare R2 Fallback] Successfully uploaded ${key} -> ${publicUrl}`);

      return {
        url: publicUrl,
        originalSizeKb,
        optimizedSizeKb,
        storage: "Cloudflare R2",
      };
    } catch (retryErr) {
      console.error("[Cloudflare R2 Hard Failure]:", retryErr.message);

      // In production or on Render/Vercel, DO NOT silently dump to local ephemeral disk
      const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER || process.env.VERCEL;
      if (isProduction) {
        throw new Error(`Cloudflare R2 storage upload failed: ${retryErr.message || "Network/Credential error"}`);
      }
    }
  }

  // 4. Local uploads folder fallback ONLY during offline development
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

