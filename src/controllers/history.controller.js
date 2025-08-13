import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { History } from "../models/history.model.js";
import redisClient from "../db/redisClient.js";

const RATE_LIMIT_WINDOW = 10;

const logMediaView = asyncHandler(async (req, res) => {
    const mediaId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
        throw new ApiError(400, "Invalid media ID");
    }

    let ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        req.ip;
    ip = ip.includes("::1") ? "127.0.0.1" : ip;

    if (!ip) {
        throw new ApiError(400, "Could not determine IP address");
    }

    const rateLimitKey = `view:${mediaId}:${ip}`;


    const alreadyViewed = await redisClient.get(rateLimitKey);
    // console.log("alreadyViewed?", alreadyViewed, "for key", rateLimitKey);

    if (alreadyViewed) {
        throw new ApiError(429, "Too many requests. Please try again later.");
    }

 
    const historyEntry = await History.create({
        media_id: mediaId,
        viewed_by_ip: ip
    });


    await redisClient.set(rateLimitKey, "1", { EX: RATE_LIMIT_WINDOW });
    const ttl = await redisClient.ttl(rateLimitKey);
    // console.log("Rate limit key set:", rateLimitKey, "TTL:", ttl);

    return res
        .status(201)
        .json(new ApiResponse(201, historyEntry, "View logged successfully"));
});

const getMediaAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid media ID");
    }

  
    const cachedData = await redisClient.get(`analytics:${id}`);
    if (cachedData) {
        return res
            .status(200)
            .json(new ApiResponse(200, JSON.parse(cachedData), "Fetched from cache"));
    }

    const totalViews = await History.countDocuments({ media_id: id });
    const uniqueIps = await History.distinct("viewed_by_ip", { media_id: id });

    const viewsPerDayData = await History.aggregate([
        { $match: { media_id: new mongoose.Types.ObjectId(id) } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const viewsPerDay = {};
    viewsPerDayData.forEach(v => {
        viewsPerDay[v._id] = v.count;
    });

    const analyticsData = {
        total_views: totalViews,
        unique_ips: uniqueIps.length,
        views_per_day: viewsPerDay
    };

    await redisClient.setEx(`analytics:${id}`, 3600, JSON.stringify(analyticsData));

    return res.status(200).json(new ApiResponse(200, analyticsData, "Fetched from database"));
});

export { logMediaView, getMediaAnalytics };
