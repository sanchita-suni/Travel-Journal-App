import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Allow all origins for development
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.resolve("uploads")));

// Routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log("Server running on port", PORT));
  })
  .catch(err => {
    console.error("DB Error:", err.message);
  });