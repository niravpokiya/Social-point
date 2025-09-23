const User = require('../models/User');
const NotificationService = require('../services/NotificationService');

exports.followUser = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.params.id;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ message: "User not found." });

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      
      // Create follow notification
      await NotificationService.createFollowNotification(targetUserId, currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ following: currentUser.following, isFollowing: !isFollowing });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
