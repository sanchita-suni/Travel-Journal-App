// backend/routes/postRoutes.js
import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// create
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title = "", description = "", placeName = "", isPublic = true, tags = [] } = req.body;
    if (!title.trim() || !description.trim() || !placeName.trim()) return res.status(400).json({ message: "Title, description and placeName required" });

    // Use Nominatim to get lat/lon
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`, {
      headers: { "User-Agent": "TravelJournal/1.0 (your-email@example.com)" }
    });
    const geoData = await geoRes.json();
    let location = { type: "Point", coordinates: [null, null], placeName };
    if (Array.isArray(geoData) && geoData.length) {
      const { lat, lon, display_name } = geoData[0];
      const latN = parseFloat(lat), lonN = parseFloat(lon);
      if (!Number.isNaN(latN) && !Number.isNaN(lonN)) {
        location = { type: "Point", coordinates: [lonN, latN], placeName: display_name || placeName };
      }
    }

    const post = new Post({
      user: req.userId,
      title: title.trim(),
      description: description.trim(),
      placeName: location.placeName || placeName,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      isPublic: isPublic === "false" ? false : !!isPublic,
      tags: Array.isArray(tags) ? tags : []
    });

    const saved = await post.save();
    res.status(201).json({ success: true, post: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).populate("user", "name avatar").sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// one
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name avatar").lean();
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// mine
router.get("/mine", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });
    await post.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// patch
router.patch("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const updates = ["title","description","placeName","isPublic","tags"];
    updates.forEach(k => { if (k in req.body) post[k] = req.body[k]; });

    if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;

    // if placeName changed, recalc coordinates
    if (req.body.placeName && req.body.placeName !== post.placeName) {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(req.body.placeName)}`, {
        headers: { "User-Agent": "TravelJournal/1.0 (your-email@example.com)" }
      });
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length) {
        const { lat, lon, display_name } = geoData[0];
        const latN = parseFloat(lat), lonN = parseFloat(lon);
        if (!Number.isNaN(latN) && !Number.isNaN(lonN)) {
          post.location = { type: "Point", coordinates: [lonN, latN], placeName: display_name || req.body.placeName };
        }
      }
    }

    const saved = await post.save();
    res.json({ success: true, post: saved });
  } catch (err) {
    console.error(err); res.status(500).json({ message: err.message });
  }
});

export default router;
