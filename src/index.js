import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectToDB from './db/dbConnect.js';
import app from './app.js';
import { initRedis } from './db/redisClient.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Cloudinary Key:', process.env.CLOUDINARY_CLOUD_KEY);

connectToDB()
  .then(async () => {
    await initRedis(); 

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on: ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MONGODB connection failed!!!: ", error));
