const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, username, emailOrPhone, password } = req.body;

  if (!username || !password || !emailOrPhone) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
  const isPhone = /^\+?[1-9]\d{1,14}$/.test(emailOrPhone);

  if (!isEmail && !isPhone) {
    return res.status(400).json({ message: "Invalid email or phone format" });
  }

  try {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) return res.status(400).json({ message: "Username taken" });

    const emailExists = isEmail && await User.findOne({ email: emailOrPhone });
    const phoneExists = isPhone && await User.findOne({ phoneNumber: emailOrPhone });

    if (emailExists) return res.status(400).json({ message: "Email already used" });
    if (phoneExists) return res.status(400).json({ message: "Phone already used" });

    const newUser = new User({
      name,
      username,
      email: isEmail ? emailOrPhone : undefined,
      phoneNumber: isPhone ? emailOrPhone : undefined,
      password: password, // Will be hashed by pre-save middleware
      
      // 🆕 Default fields
      followers: [],
      following: [],
      avatar: '/default-avatar.png',
      bio: ''
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phoneNumber
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login (by email or phone)
router.post('/login', async (req, res) => {
  let { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password)
    return res.status(400).json({ message: "Email/Phone and password are required." });

  try {
    const isEmail = /\S+@\S+\.\S+/.test(emailOrPhone);
    if (isEmail) emailOrPhone = emailOrPhone.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phoneNumber: emailOrPhone }]
    }).select("+password");  // 👈 force include password

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
 
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new token
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("Token refresh error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;


