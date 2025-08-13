import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// route imports
import userRoutes from "./routes/user.routes.js";
import mediaRoutes from "./routes/media.routes.js";

const app = express();

// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// mount routes
app.use("/auth", userRoutes); // POST /auth/signup, POST /auth/login
app.use("/media", mediaRoutes); // POST /media, GET /media/:id/stream-url

export default app;
