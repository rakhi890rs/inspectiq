import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "../config/constants.js";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      default: NOTIFICATION_TYPE.GENERAL,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // frontend route to navigate to on click
    isRead: { type: Boolean, default: false },
    relatedEntity: {
      kind: { type: String }, // "Building" | "NOCApplication" | "Certificate" | "Audit"
      id: { type: mongoose.Schema.Types.ObjectId },
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
