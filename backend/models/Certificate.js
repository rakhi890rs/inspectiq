import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, unique: true },
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    nocApplication: { type: mongoose.Schema.Types.ObjectId, ref: "NOCApplication" },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    issueDate: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },

    pdfUrl: { type: String },
    qrCodeUrl: { type: String },
    digitalSignatureUrl: { type: String },

    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },

    safetyScore: { type: Number, min: 0, max: 100 },

    verificationCount: { type: Number, default: 0 }, // times the QR was scanned/verified
  },
  { timestamps: true }
);

certificateSchema.pre("save", function (next) {
  if (!this.certificateNumber) {
    const year = new Date().getFullYear();
    this.certificateNumber = `CERT-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;