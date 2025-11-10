import express from 'express';
import Post from '../models/Post.js';
const router = express.Router();

// GET all public posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ isPublic: true }).populate('user', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET posts by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new post
router.post('/', async (req, res) => {
  const post = new Post(req.body);
  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
