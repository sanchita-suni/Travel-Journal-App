import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    placeName: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    imageUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ location: "2dsphere" });

export default mongoose.model("Post", postSchema);
