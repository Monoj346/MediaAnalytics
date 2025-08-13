import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Load .env here too (optional if already loaded in index.js)
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    throw error;
  }
};

export default uploadOnCloudinary;
