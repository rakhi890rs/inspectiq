import mongoose from "mongoose";
import { NOC_STATUS } from "../config/constants.js";

const nocApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, unique: true },
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedInspector: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    applicationType: {
      type: String,
      enum: ["new", "renewal", "modification"],
      default: "new",
    },

    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    audit: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },

    status: {
      type: String,
      enum: Object.values(NOC_STATUS),
      default: NOC_STATUS.SUBMITTED,
    },

    statusHistory: [
      {
        status: { type: String, enum: Object.values(NOC_STATUS) },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
      },
    ],

    rejectionReason: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

// Generates a unique, sequential-looking application number
nocApplicationSchema.pre("save", function (next) {
  if (!this.applicationNumber) {
    const year = new Date().getFullYear();
    this.applicationNumber = `NOC-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  next();
});

const NOCApplication = mongoose.model("NOCApplication", nocApplicationSchema);
export default NOCApplication;
