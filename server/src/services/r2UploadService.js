import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3Client for Cloudflare R2
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

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
  const bucketName = process.env.R2_BUCKET_NAME || "agal-boutique-images";
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;

  // 2. Upload to Cloudflare R2 if credentials exist
  if (r2Client && publicDomain) {
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
    } catch (err) {
      console.error("Cloudflare R2 Upload Error, falling back to local storage:", err.message);
    }
  }

  // 3. Fallback to local uploads folder if R2 credentials are not set
  const publicDir = path.join(__dirname, "../../public/uploads");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, filename);
  fs.writeFileSync(filePath, optimizedBuffer);

  const localUrl = `/uploads/${filename}`;
  return {
    url: localUrl,
    originalSizeKb,
    optimizedSizeKb,
    storage: "Local Storage Fallback",
  };
}

