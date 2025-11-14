const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/AuthMiddleware');

// Get user settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update theme preference
router.patch('/theme', authMiddleware, async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme || !['light', 'dark', 'purple', 'ocean', 'sunset'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme. Must be one of: light, dark, purple, ocean, sunset'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 'preferences.theme': theme },
      { new: true, runValidators: true }
    ).select('preferences.theme');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { theme: user.preferences.theme }
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update notification preferences
router.patch('/notifications', authMiddleware, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!notifications || typeof notifications !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid notifications object'
      });
    }

    const allowedKeys = ['email', 'push', 'messages', 'likes', 'comments', 'follows'];
    const updateData = {};
    
    for (const key of allowedKeys) {
      if (notifications.hasOwnProperty(key) && typeof notifications[key] === 'boolean') {
        updateData[`preferences.notifications.${key}`] = notifications[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid notification preferences provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('preferences.notifications');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: user.preferences.notifications
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update privacy preferences
router.patch('/privacy', authMiddleware, async (req, res) => {
  try {
    const { privacy } = req.body;
    
    if (!privacy || typeof privacy !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid privacy object'
      });
    }

    const updateData = {};
    
    // Update profile visibility
    if (privacy.profileVisibility && ['public', 'friends', 'private'].includes(privacy.profileVisibility)) {
      updateData['preferences.privacy.profileVisibility'] = privacy.profileVisibility;
    }
    
    // Update other privacy settings
    const privacyKeys = ['showEmail', 'showPhone', 'showBirthday'];
    for (const key of privacyKeys) {
      if (privacy.hasOwnProperty(key) && typeof privacy[key] === 'boolean') {
        updateData[`preferences.privacy.${key}`] = privacy[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid privacy preferences provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('preferences.privacy');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Privacy preferences updated successfully',
      data: user.preferences.privacy
    });
  } catch (error) {
    console.error('Error updating privacy preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update all preferences at once
router.patch('/all', authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences object'
      });
    }

    const updateData = {};
    
    // Update theme
    if (preferences.theme && ['light', 'dark', 'purple', 'ocean', 'sunset'].includes(preferences.theme)) {
      updateData['preferences.theme'] = preferences.theme;
    }
    
    // Update notifications
    if (preferences.notifications && typeof preferences.notifications === 'object') {
      const notificationKeys = ['email', 'push', 'messages', 'likes', 'comments', 'follows'];
      for (const key of notificationKeys) {
        if (preferences.notifications.hasOwnProperty(key) && typeof preferences.notifications[key] === 'boolean') {
          updateData[`preferences.notifications.${key}`] = preferences.notifications[key];
        }
      }
    }
    
    // Update privacy
    if (preferences.privacy && typeof preferences.privacy === 'object') {
      if (preferences.privacy.profileVisibility && ['public', 'friends', 'private'].includes(preferences.privacy.profileVisibility)) {
        updateData['preferences.privacy.profileVisibility'] = preferences.privacy.profileVisibility;
      }
      
      const privacyKeys = ['showEmail', 'showPhone', 'showBirthday'];
      for (const key of privacyKeys) {
        if (preferences.privacy.hasOwnProperty(key) && typeof preferences.privacy[key] === 'boolean') {
          updateData[`preferences.privacy.${key}`] = preferences.privacy[key];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preferences provided'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset preferences to default
router.post('/reset', authMiddleware, async (req, res) => {
  try {
    const defaultPreferences = {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        messages: true,
        likes: true,
        comments: true,
        follows: true
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showBirthday: false
      }
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: defaultPreferences },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences reset to default successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error resetting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
