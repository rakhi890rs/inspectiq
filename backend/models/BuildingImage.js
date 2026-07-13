import mongoose from "mongoose";

const buildingImageSchema = new mongoose.Schema(
  {
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    url: { type: String, required: true },
    publicId: { type: String }, // cloudinary public_id, needed for deletion
    caption: { type: String, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const BuildingImage = mongoose.model("BuildingImage", buildingImageSchema);
export default BuildingImage;
