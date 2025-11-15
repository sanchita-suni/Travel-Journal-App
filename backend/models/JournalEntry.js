import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    // --- Basic Details ---
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // --- Location Info ---
    placeName: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // --- Images ---
    imageUrls: [{ type: String }],

    // --- Visit Date ---
    dateVisited: { type: Date, required: true },

    // --- Visibility ---
    isPublic: { type: Boolean, default: false },

    // --- Ownership ---
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // --- Metadata ---
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// --- Index for Geo Queries (for map pins) ---
journalEntrySchema.index({ location: "2dsphere" });

export default mongoose.model("JournalEntry", journalEntrySchema);
