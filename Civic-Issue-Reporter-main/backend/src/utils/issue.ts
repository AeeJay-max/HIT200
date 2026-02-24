import { ILocation } from "./location";
import { Types } from "mongoose";

export interface IIssue {
  citizenId: Types.ObjectId; // reference to Citizen
  issueType:
    | "Potholes"
    | "Burst Water Pipes"
    | "Sewer Issues"
    | "Streetlights"
    | "Traffic Lights"
    | "Other";
  title: string;
  description: string;
  status?: "Reported" | "In Progress" | "Resolved" | "Rejected" | "Pending";
  location: ILocation; // embedded location object
  media?: Types.ObjectId[]; // refs to multimedia
  createdAt?: Date;
  updatedAt?: Date;
  handledBy?: Object | string; 
}
