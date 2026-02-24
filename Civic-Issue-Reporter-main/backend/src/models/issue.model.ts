import { model, Schema, Document } from "mongoose";
import { IIssue } from "../utils/issue";
import { ILocation } from "../utils/location";

const locationSchema = new Schema<ILocation>(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    address: String,
  },
  { _id: false }
);

const IssueSchema = new Schema<IIssue & Document>(
  {
    citizenId: {
      type: Schema.Types.ObjectId,
      ref: "Citizen",
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        "Potholes",
        "Burst Water Pipes",
        "Sewer Issues",
        "Streetlights",
        "Traffic Lights",
        "Other",
      ],
      default: "Other",
      required: true,
    },
    title: {
      type: String,
      unique: true,
      required: true,
      maxlength: 100,
      minlength: 5,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Reported", "In Progress", "Resolved", "Rejected", "Pending"],
      default: "Reported",
    },
    location: {
      type: locationSchema,
      required: true,
    },
    media: {
      type: Schema.Types.ObjectId,
      ref: "Multimedia",
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export const LocationModel = model("Location", locationSchema);

export interface IssueDocument extends IIssue, Document { }
export const IssueModel = model<IssueDocument>("Issue", IssueSchema);
