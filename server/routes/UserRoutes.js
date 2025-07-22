const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/AuthMiddleware");

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
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, avatar },
      { new: true }
    ).select("-password");
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get public profile by username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" }); // <-- notice message key
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // <-- match key for consistency
  }
});


module.exports = router;
