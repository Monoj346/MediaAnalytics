📊 MediaAnalytics – Media Analytics & Access Backend
📌 Overview

MediaAnalytics is a backend service built to track and analyze media consumption patterns.
It allows you to log media views, analyze trends, and optimize performance using caching (Redis) and rate-limiting.
This backend is designed for scalability, speed, and security, using Node.js, Express, MongoDB, and Redis.


🚀 Features

Media View Tracking – Records when a user views a media item.
IP-based Rate Limiting – Prevents abuse by limiting view logging per user/IP.

Analytics Dashboard Data –

Total Views
Unique Viewers (by IP)
Views per Day statistics

Redis Caching – Speeds up analytics fetches by serving data from cache.
Cloudinary Integration – For storing and managing media assets.
MongoDB Database – Stores persistent analytics data.
REST API – Easy to integrate with frontend apps or external services.

🛠 Tech Stack

Backend: Node.js, Express.js
Database: MongoDB (Mongoose ORM)
Caching: Redis
Media Storage: Cloudinary
Environment Variables: dotenv
Security: Rate limiting, Error handling


⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/MediaAnalytics.git
cd MediaAnalytics

2️⃣ Install Dependencies
npm install

3️⃣ Set Up Environment Variables
Create a .env file in the project root:

PORT=8000
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_CLOUD_KEY=your_cloud_key
CLOUDINARY_CLOUD_SECRET=your_cloud_secret

4️⃣ Start Redis

On Windows (with Redis installed):

redis-server


Check Connection:
redis-cli ping
# PONG

5️⃣ Run the Server
npm run dev


Your backend will be live on:

http://localhost:8000