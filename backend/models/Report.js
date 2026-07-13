import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["audit", "compliance", "risk", "noc", "monthly", "yearly"],
      required: true,
    },
    format: { type: String, enum: ["pdf", "excel", "csv"], required: true },
    filters: { type: mongoose.Schema.Types.Mixed }, // date range, district, status, etc.
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
