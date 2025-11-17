// backend/routes/bookRoutes.js
import express from "express";
import Book from "../models/Books.js";

const router = express.Router();

// Create a book for a username
router.post("/", async (req, res) => {
  try {
    const { username, title, coverImg, pages } = req.body;
    if (!username || !title) {
      return res
        .status(400)
        .json({ message: "username and title are required" });
    }

    const book = await Book.create({ username, title, coverImg, pages });

    res.status(201).json({ success: true, book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all books for a username (for future My Library)
router.get("/by-user/:username", async (req, res) => {
  try {
    const books = await Book.find({ username: req.params.username }).sort({
      createdAt: -1,
    });
    res.json({ success: true, books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;