import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nocApplication: { type: mongoose.Schema.Types.ObjectId, ref: "NOCApplication" },

    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },

    checklistItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuditChecklist" }],

    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String, trim: true }, // AI-generated or manual inspection summary

    digitalSignature: { type: String }, // base64 / image url of auditor signature
    reportUrl: { type: String }, // generated PDF report

    aiSuggestions: [{ type: String }], // AI compliance suggestions
  },
  { timestamps: true }
);

const Audit = mongoose.model("Audit", auditSchema);
export default Audit;
