import mongoose from "mongoose";
import { RISK_LEVEL } from "../config/constants.js";

const EQUIPMENT_CATEGORIES = [
  "fire_alarm",
  "smoke_detector",
  "fire_extinguisher",
  "sprinkler_system",
  "emergency_lights",
  "exit_signage",
  "lift",
  "generator",
  "electrical_panel",
  "cctv",
  "access_control",
  "gas_detector",
  "water_pump",
  "hvac",
  "emergency_exit_door",
  "medical_equipment",
  "structural_sensors",
];

const assetSchema = new mongoose.Schema(
  {
    assetCode: { type: String, unique: true }, // auto-generated e.g. AST-24-000123
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: EQUIPMENT_CATEGORIES, required: true },

    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    floor: { type: String, trim: true },
    location: { type: String, trim: true }, // e.g. "Near east stairwell"

    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },

    installationDate: { type: Date },
    warrantyExpiry: { type: Date },

    condition: {
      type: String,
      enum: ["operational", "needs_service", "maintenance_scheduled", "critical", "out_of_service"],
      default: "operational",
    },
    safetyStatus: {
      type: String,
      enum: ["compliant", "non_compliant", "under_review", "pending"],
      default: "pending",
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVEL),
      default: RISK_LEVEL.LOW,
    },

    nextInspectionDate: { type: Date },
    lastInspectionDate: { type: Date },
    maintenanceDueDate: { type: Date },

    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    complianceScore: { type: Number, min: 0, max: 100, default: 100 },

    qrCode: { type: String },
    manualUrl: { type: String }, // uploaded equipment manual
    certificateUrl: { type: String },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assetSchema.index({ name: "text", serialNumber: "text" });

// Generates a short human-readable asset code e.g. AST-24-000123
assetSchema.pre("save", function (next) {
  if (!this.assetCode) {
    const year = new Date().getFullYear().toString().slice(-2);
    this.assetCode = `AST-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

export { EQUIPMENT_CATEGORIES };
const Asset = mongoose.model("Asset", assetSchema);
export default Asset;