const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const Notification = require("../models/Notification");

// Get user notifications (max 20, most recent first)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('sender', 'name username avatar isVerified')
      .populate('post', 'images caption')
      .sort({ createdAt: -1 })
      .limit(20);

    // Mark all notifications as read after fetching
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: err.message
    });
  }
});

// Get unread notification count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: err.message
    });
  }
});

// Mark specific notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: err.message
    });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
      error: err.message
    });
  }
});

module.exports = router;






