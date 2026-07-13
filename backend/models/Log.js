import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "BUILDING_CREATED", "NOC_APPROVED"
    entity: {
      kind: String,
      id: mongoose.Schema.Types.ObjectId,
    },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
export default Log;
