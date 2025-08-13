import { Schema, model } from "mongoose";

const HistorySchema = new Schema(
    {
        media_id: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            required: true
        },
        viewed_by_ip: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false 
    }
);

export const History = model("History", HistorySchema);
