import mongoose from "mongoose";
import { RISK_LEVEL } from "../config/constants.js";

const riskScoreSchema = new mongoose.Schema(
  {
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    audit: { type: mongoose.Schema.Types.ObjectId, ref: "Audit" },

    score: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: Object.values(RISK_LEVEL), required: true },

    factors: [
      {
        category: String, // e.g. "fire", "structural"
        contribution: Number, // percentage weight contributing to the score
        note: String,
      },
    ],

    predictedBy: { type: String, enum: ["ai_model", "manual"], default: "ai_model" },
    recommendation: { type: String, trim: true },
  },
  { timestamps: true }
);

const RiskScore = mongoose.model("RiskScore", riskScoreSchema);
export default RiskScore;
