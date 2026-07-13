import mongoose from "mongoose";
import { AUDIT_ITEM_RESULT, AUDIT_CATEGORIES } from "../config/constants.js";

const auditChecklistSchema = new mongoose.Schema(
  {
    audit: { type: mongoose.Schema.Types.ObjectId, ref: "Audit", required: true },
    category: { type: String, enum: AUDIT_CATEGORIES, required: true },
    itemName: { type: String, required: true },
    result: {
      type: String,
      enum: Object.values(AUDIT_ITEM_RESULT),
      required: true,
    },
    remarks: { type: String, trim: true },
    images: [{ type: String }], // cloudinary URLs
    videos: [{ type: String }],
    voiceNoteUrl: { type: String },
    weight: { type: Number, default: 1 }, // used to compute weighted audit score
  },
  { timestamps: true }
);

const AuditChecklist = mongoose.model("AuditChecklist", auditChecklistSchema);
export default AuditChecklist;
