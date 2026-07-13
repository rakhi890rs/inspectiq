import mongoose from "mongoose";
import { RISK_LEVEL } from "../config/constants.js";

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    buildingCode: { type: String, unique: true }, // auto-generated, used in QR
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["residential", "commercial", "industrial", "institutional", "mixed_use"],
      default: "commercial",
    },
    numberOfFloors: { type: Number, default: 1 },
    totalArea: { type: Number }, // sq ft
    yearBuilt: { type: Number },
    occupancy: { type: Number },

    address: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },
    location: {
      lat: Number,
      lng: Number,
    },

    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "BuildingImage" }],

    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVEL),
      default: RISK_LEVEL.LOW,
    },

    safetyStatus: {
      type: String,
      enum: ["compliant", "non_compliant", "under_review", "pending"],
      default: "pending",
    },

    qrCode: { type: String }, // data URL / cloudinary URL for QR verification

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

buildingSchema.index({ name: "text", "address.city": "text", "address.district": "text" });

// Generates a short human-readable building code e.g. SB-24-000123
buildingSchema.pre("save", function (next) {
  if (!this.buildingCode) {
    const year = new Date().getFullYear().toString().slice(-2);
    this.buildingCode = `SB-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

const Building = mongoose.model("Building", buildingSchema);
export default Building;
