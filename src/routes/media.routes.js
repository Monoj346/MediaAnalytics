import { Router } from "express";
import { publishMedia, getStreamUrl } from "../controllers/media.controller.js";
import { logMediaView, getMediaAnalytics } from "../controllers/history.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Upload new media
router.post(
    "/",
    verifyJWT,
    upload.fields([{ name: "media", maxCount: 1 }]),
    publishMedia
);

// Generate a signed stream URL
router.get("/:id/stream-url", verifyJWT, getStreamUrl);

// Log a view for media
router.post("/:id/view", verifyJWT, logMediaView);

// Get analytics for media
router.get("/:id/analytics", verifyJWT, getMediaAnalytics);

export default router;
