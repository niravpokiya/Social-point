const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/AuthMiddleware");
const { updateProfile } = require("../controllers/userController");
const multer = require('multer');
const path = require('path');

// ✅ Get current user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update current user's profile (ONLY THIS route now handles update)
router.put('/me', authMiddleware, updateProfile);

// ✅ Get public profile by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Avatar Upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`),
});
const upload = multer({ storage });

router.post('/upload-avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`; // use your domain if needed
  res.json({ url: fileUrl });
});


const { followUser } = require("../controllers/FollowController");
router.put("/:id/follow", authMiddleware, followUser);


module.exports = router;



