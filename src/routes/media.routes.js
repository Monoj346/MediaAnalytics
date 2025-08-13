import { Router } from "express";
import { publishMedia, getStreamUrl } from "../controllers/media.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; 
import { verifyJWT } from "../middlewares/auth.middleware.js"; // assuming you have JWT auth

const router = Router();

// POST /media (authenticated)
router.post("/", verifyJWT, upload.fields([{ name: "media", maxCount: 1 }]), publishMedia);

// GET /media/:id/stream-url (authenticated)
router.get("/:id/stream-url", verifyJWT, getStreamUrl);

export default router;
