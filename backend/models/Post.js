import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    placeName: { type: String, default: "Digital Entry" }, // Default for book entries
    
    // GeoJSON for Maps
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // Default 0,0 if no map pin
    },
    
    imageUrl: { type: String, default: "" },
    isPublic: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
    likes: { type: Number, default: 0 },

    // ⭐ NEW: Store the Book Pages and Stickers
    bookData: {
      pages: { type: Object, default: {} },     // Stores text per page: { "0": "Dear Diary...", "1": "..." }
      stickers: { type: Array, default: [] },   // Stores sticker array: [{x, y, src, rotation...}]
      cover: { type: String, default: "" }      // Which cover image was chosen
    }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ location: "2dsphere" });

export default mongoose.model("Post", postSchema);