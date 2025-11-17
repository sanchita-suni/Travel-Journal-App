import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    placeName: { type: String, default: "Digital Entry" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    imageUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    bookData: {
      pages: { type: Object, default: {} },
      stickers: { type: Array, default: [] },
      cover: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

postSchema.index({ location: "2dsphere" });
export default mongoose.model("Post", postSchema);