import { model, Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
    title: string;
    message: string;
    type: "Power Outage" | "Water Supply" | "Road Maintenance" | "Other";
    createdBy: Types.ObjectId;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["Power Outage", "Water Supply", "Road Maintenance", "Other"],
            default: "Other"
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>("Notification", NotificationSchema);
