import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectToDB from './db/dbConnect.js';
import app from './app.js';

// ES modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Quick check
console.log('Cloudinary Key:', process.env.CLOUDINARY_CLOUD_KEY);

// Connect to DB and start server
connectToDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on: ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MONGODB connection failed!!!: ", error));
