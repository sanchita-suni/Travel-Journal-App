import express from "express";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// --- Multer Setup for Image Uploads ---
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// --- CREATE POST (With Book Data & Image) ---
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { 
      title = "Untitled Journal", 
      description = "A digital journal entry.", 
      placeName = "Digital Entry", 
      isPublic, 
      tags, 
      bookData 
    } = req.body;

    if (!title.trim()) return res.status(400).json({ message: "Title is required" });

    let location = { type: "Point", coordinates: [0, 0], placeName: placeName || "Digital Entry" };
    
    if (placeName && placeName !== "Digital Entry") {
       try {
         const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`, {
           headers: { "User-Agent": "TravelJournal/1.0" }
         });
         const geoData = await geoRes.json();
         if (Array.isArray(geoData) && geoData.length) {
           const { lat, lon, display_name } = geoData[0];
           const latN = parseFloat(lat), lonN = parseFloat(lon);
           if (!Number.isNaN(latN) && !Number.isNaN(lonN)) {
             location = { type: "Point", coordinates: [lonN, latN], placeName: display_name };
           }
         }
       } catch (e) {
         console.log("Geo error ignored:", e.message);
       }
    }

    let parsedBookData = {};
    if (bookData) {
        try { parsedBookData = JSON.parse(bookData); } catch(e) { console.error("Error parsing bookData:", e); }
    }

    const parsedTags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []);
    const finalIsPublic = isPublic === 'true' || isPublic === true;

    const post = new Post({
      user: req.userId,
      title: title.trim(),
      description: description.trim(),
      placeName: location.placeName,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      isPublic: finalIsPublic,
      tags: parsedTags,
      bookData: parsedBookData
    });

    const saved = await post.save();
    res.status(201).json({ success: true, post: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================================================================
// 🚨 IMPORTANT: Specific routes (like /mine) MUST come BEFORE /:id
// ==================================================================

// --- MY POSTS (Moved UP!) ---
router.get("/mine", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- PUBLIC FEED ---
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).populate("user", "name avatar").sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET SINGLE POST (Dynamic ID Route - Must be last of the GETs) ---
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user", "name avatar").lean();
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- DELETE POST ---
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

// --- UPDATE POST (PATCH) ---
router.patch("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    if (post.user.toString() !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const updates = ["title","description","placeName","isPublic","tags"];
    updates.forEach(k => { if (k in req.body) post[k] = req.body[k]; });

    if (req.file) post.imageUrl = `/uploads/${req.file.filename}`;

    if (req.body.placeName && req.body.placeName !== post.placeName) {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(req.body.placeName)}`, {
        headers: { "User-Agent": "TravelJournal/1.0" }
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

    if (req.body.bookData) {
        try {
             post.bookData = JSON.parse(req.body.bookData);
        } catch(e) { console.error(e); }
    }

    const saved = await post.save();
    res.json({ success: true, post: saved });
  } catch (err) {
    console.error(err); res.status(500).json({ message: err.message });
  }
});

export default router;