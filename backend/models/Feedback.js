import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    building: { type: mongoose.Schema.Types.ObjectId, ref: "Building" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    isPublicTestimonial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
