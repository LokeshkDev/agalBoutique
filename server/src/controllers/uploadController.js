import multer from "multer";
import { optimizeAndUploadImage } from "../services/r2UploadService.js";

// Multer memory storage (buffer held in memory for Sharp processing)
const storage = multer.memoryStorage();

const rawUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed."));
    }
  },
}).single("image");

export function uploadMiddleware(req, res, next) {
  rawUpload(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({ success: false, message: err.message || "Invalid image upload" });
    }
    next();
  });
}

// POST /api/admin/upload
export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const result = await optimizeAndUploadImage(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      message: "Image uploaded and optimized successfully",
      url: result.url,
      originalSizeKb: result.originalSizeKb,
      optimizedSizeKb: result.optimizedSizeKb,
      savedPercent: Math.round(((result.originalSizeKb - result.optimizedSizeKb) / result.originalSizeKb) * 100),
      storage: result.storage,
    });
  } catch (err) {
    const isClientError = err.message?.includes("unsupported image format") || err.message?.includes("Input buffer");
    if (!isClientError) {
      console.error("Error in uploadImage controller:", err);
    }
    const statusCode = isClientError ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: isClientError
        ? "The uploaded file is not a valid or supported image format (JPEG, PNG, WebP, GIF)."
        : (err.message || "Failed to process and upload image"),
    });
  }
}

