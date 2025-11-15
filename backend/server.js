// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// serve uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
  })
  .catch(err => {
    console.error("❌ DB Error:", err.message);
  });
