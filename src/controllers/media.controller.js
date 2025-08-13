import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { Media } from "../models/media.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import cloudinary from "cloudinary";

const publishMedia = asyncHandler(async (req, res) => {
    const { title, type } = req.body;
    
    if ([title, type].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const mediaLocalPath = req.files?.media[0]?.path;

    if (!mediaLocalPath) {
        throw new ApiError(400, "mediaFileLocalPath is required");
    }

    // Upload to Cloudinary
    const mediaFile = await uploadOnCloudinary(mediaLocalPath);

    if (!mediaFile || !mediaFile.secure_url) {
        throw new ApiError(400, "Media file not uploaded properly");
    }

    // Save metadata in MongoDB
    const media = await Media.create({
        title,
        type,
        file_url: mediaFile.secure_url  // <-- use secure_url
    });

    return res
        .status(200)
        .json(new ApiResponse(200, media, "Media uploaded successfully"));
});

const getStreamUrl = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) {
        throw new ApiError(404, "Media not found");
    }

    // Extract public_id from Cloudinary URL
    const publicId = media.file_url
        .split("/")
        .slice(-1)[0]
        .split(".")[0];

    // Generate signed URL valid for 10 minutes (600 seconds)
    const signedUrl = cloudinary.v2.utils.private_download_url(
        publicId,
        media.type === "video" ? "mp4" : "mp3",
        {
            type: "authenticated",
            expires_at: Math.floor(Date.now() / 1000) + 600
        }
    );

    return res.status(200).json(
        new ApiResponse(200, { streamUrl: signedUrl }, "Stream URL generated successfully")
    );
});

export { publishMedia, getStreamUrl };
