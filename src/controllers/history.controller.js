import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { History } from "../models/history.model.js";

/**
 * Log a media view (stores media_id and viewer's IP)
 */
const logMediaView = asyncHandler(async (req, res) => {
    const mediaId = req.params.id;

    // Validate media ID
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
        throw new ApiError(400, "Invalid media ID");
    }

    // Get IP address (handles proxies)
    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip;

    if (!ip) {
        throw new ApiError(400, "Could not determine IP address");
    }

    // Save to DB
    const historyEntry = await History.create({
        media_id: mediaId,
        viewed_by_ip: ip
    });

    return res
        .status(201)
        .json(new ApiResponse(201, historyEntry, "View logged successfully"));
});

/**
 * Get analytics for a specific media
 */
const getMediaAnalytics = asyncHandler(async (req, res) => {
    const mediaId = req.params.id;

    // Validate media ID
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
        throw new ApiError(400, "Invalid media ID");
    }

    const analytics = await History.aggregate([
        {
            $match: { media_id: new mongoose.Types.ObjectId(mediaId) }
        },
        {
            $group: {
                _id: null,
                total_views: { $sum: 1 },
                unique_ips: { $addToSet: "$viewed_by_ip" },
                views_per_day: {
                    $push: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                        }
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                total_views: 1,
                unique_ips: { $size: "$unique_ips" },
                views_per_day: {
                    $arrayToObject: {
                        $map: {
                            input: { $setUnion: ["$views_per_day.date", []] },
                            as: "d",
                            in: {
                                k: "$$d",
                                v: {
                                    $size: {
                                        $filter: {
                                            input: "$views_per_day",
                                            as: "vpd",
                                            cond: { $eq: ["$$vpd.date", "$$d"] }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!analytics.length) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, {
                    total_views: 0,
                    unique_ips: 0,
                    views_per_day: {}
                }, "No analytics data available")
            );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, analytics[0], "Analytics fetched successfully"));
});

export { logMediaView, getMediaAnalytics };
