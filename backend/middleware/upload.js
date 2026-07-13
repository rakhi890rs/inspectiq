import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Files are held in memory, then streamed to Cloudinary. This avoids the
// abandoned multer-storage-cloudinary package (which only supports the
// Cloudinary v1 SDK) while still supporting images, videos, and PDFs.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Streams a single in-memory file buffer to Cloudinary.
// Returns { url, publicId } on success.
export const uploadBufferToCloudinary = (buffer, folder = "safebuild-ai") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Convenience middleware: uploads req.file (from `upload.single(...)`) to
// Cloudinary and attaches the result as req.uploadedFile. Use after multer.
export const pushToCloudinary = (folder) => async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.uploadedFile = await uploadBufferToCloudinary(req.file.buffer, folder);
    next();
  } catch (err) {
    next(err);
  }
};

export { cloudinary };
export default upload;