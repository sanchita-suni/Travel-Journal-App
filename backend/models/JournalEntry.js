import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },

  // For Map Feature
  coordinates: {
    lat: Number,
    lng: Number
  },

  dateVisited: { type: Date, required: true },
  description: String,
  images: [String],

  // For Shared Community Journal Feature
  isPublic: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("JournalEntry", journalEntrySchema);
