import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "Emptfile");

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

export const upload = multer({ storage });
