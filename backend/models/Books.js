import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // from localStorage travelUser.username
    title: { type: String, required: true, trim: true },
    coverImg: { type: String, default: "" },
    pages: {
      type: Map,
      of: String, // page index -> HTML content
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);