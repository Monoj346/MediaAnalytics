import { Schema, model } from "mongoose";

const mediaSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["video", "audio"],
            required: true
        },
        file_url: {
            type: String,
            required: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // only createdAt
        versionKey: false
    }
);

export const Media = model("Media", mediaSchema);
