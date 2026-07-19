import mongoose from "mongoose";
import { RISK_LEVEL } from "../config/constants.js";

const auditSchema = new mongoose.Schema(
  {
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nocApplication: { type: mongoose.Schema.Types.ObjectId, ref: "NOCApplication" },

    inspectionType: {
      type: String,
      enum: ["routine", "emergency", "annual", "follow_up"],
      default: "routine",
    },

    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    durationMinutes: { type: Number },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "pending_review", "failed", "cancelled"],
      default: "scheduled",
    },

    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVEL),
    },

    checklistItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuditChecklist" }],

    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String, trim: true }, // AI-generated or manual inspection summary
    inspectorNotes: { type: String, trim: true },

    digitalSignature: { type: String }, // base64 / image url of auditor signature
    reportUrl: { type: String }, // generated PDF report

    aiSuggestions: [{ type: String }], // AI compliance suggestions

    reinspectionOf: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" }, // links a follow-up to its original
  },
  { timestamps: true }
);

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;