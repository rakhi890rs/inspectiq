import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    nocApplication: { type: mongoose.Schema.Types.ObjectId, ref: "NOCApplication" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "ownership_proof",
        "structural_certificate",
        "fire_noc",
        "electrical_certificate",
        "environmental_clearance",
        "identity_proof",
        "other",
      ],
      default: "other",
    },

    fileUrl: { type: String, required: true },
    publicId: { type: String },
    fileType: { type: String }, // pdf, jpg, png, docx...

    versions: [
      {
        fileUrl: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    expiryDate: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

documentSchema.index({ title: "text" });

const Document = mongoose.model("Document", documentSchema);
export default Document;
