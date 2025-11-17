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

// --- CREATE POST ---
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title = "Untitled", description = "", placeName = "Digital Entry", isPublic, tags, bookData } = req.body;
    
    if (!title.trim()) return res.status(400).json({ message: "Title required" });

    let location = { type: "Point", coordinates: [0, 0], placeName: placeName || "Digital Entry" };
    
    // Geocoding
    if (placeName && placeName !== "Digital Entry") {
       try {
         const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`, { headers: { "User-Agent": "TravelJournal/1.0" } });
         const geoData = await geoRes.json();
         if (Array.isArray(geoData) && geoData.length) {
           const { lat, lon, display_name } = geoData[0];
           location = { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)], placeName: display_name };
         }
       } catch (e) { console.log("Geo error:", e.message); }
    }

    let parsedBookData = {};
    if (bookData) {
        try { parsedBookData = JSON.parse(bookData); } catch(e) { console.error("BookData parse error:", e); }
    }

    const post = new Post({
      user: req.userId,
      title: title.trim(),
      description: description.trim(),
      placeName: location.placeName,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      isPublic: isPublic === 'true' || isPublic === true,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
      bookData: parsedBookData
    });

    const saved = await post.save();
    res.status(201).json({ success: true, post: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- MY POSTS (MUST BE BEFORE /:id) ---
router.get("/mine", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PUBLIC FEED ---
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).populate("user", "name").sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET SINGLE POST ---
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name").lean();
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE ---
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

// --- PATCH ---
router.patch("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const updates = ["title","description","placeName","isPublic","tags"];
    updates.forEach(k => { if (k in req.body) post[k] = req.body[k]; });

    if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;
    if (req.body.bookData) {
        try { post.bookData = JSON.parse(req.body.bookData); } catch(e) {}
    }

    const saved = await post.save();
    res.json({ success: true, post: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;