const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { updateProfile } = require("../controllers/userController");
const { followUser } = require("../controllers/FollowController");
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`),
});
const upload = multer({ storage });

// ✅ Get current user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update current user's profile
router.put('/me', authMiddleware, updateProfile);

// ✅ Avatar Upload
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ✅ Follow/Unfollow user
router.put("/:id/follow", authMiddleware, followUser);

// ✅ Get user's following list
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username avatar isVerified');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.following || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get user's followers list
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username avatar isVerified');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.followers || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all users for discovery
router.get("/discover", async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name username avatar isVerified bio')
      .limit(50)
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all users (for testing)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name username avatar isVerified')
      .limit(100);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Toggle close friend status
router.put("/close-friends/:friendId", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const friendId = req.params.friendId;
    
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Initialize closeFriends array if it doesn't exist
    if (!currentUser.closeFriends) {
      currentUser.closeFriends = [];
    }
    
    const isCloseFriend = currentUser.closeFriends.includes(friendId);
    
    if (isCloseFriend) {
      // Remove from close friends
      currentUser.closeFriends.pull(friendId);
    } else {
      // Add to close friends
      currentUser.closeFriends.push(friendId);
    }
    
    await currentUser.save();
    
    res.status(200).json({ 
      isCloseFriend: !isCloseFriend,
      closeFriends: currentUser.closeFriends 
    });
  } catch (err) {
    console.error("Close friend error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Search users by username
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query.trim(), $options: 'i' } },
        { name: { $regex: query.trim(), $options: 'i' } }
      ],
      isActive: true
    }).select('name username avatar isVerified').limit(10);
    
    console.log(`Search for "${query}" returned ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get user by ID (for chat functionality)
router.get("/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get user by ID (specific route before username route)
router.get("/id/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name username avatar bio isVerified followers following posts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get public profile by username (MUST be last to avoid conflicts)
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;



