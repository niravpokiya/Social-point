const Notification = require('../models/Notification');

class NotificationService {
  // Create a notification
  static async createNotification(userId, senderId, type, postId = null) {
    try {
      // Don't create notification if user is trying to notify themselves
      if (userId.toString() === senderId.toString()) {
        return null;
      }

      // Check if similar notification already exists (to avoid spam)
      const existingNotification = await Notification.findOne({
        user: userId,
        sender: senderId,
        type: type,
        post: postId,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 minutes
      });

      if (existingNotification) {
        return existingNotification;
      }

      const notification = new Notification({
        user: userId,
        sender: senderId,
        type: type,
        post: postId
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Create follow notification
  static async createFollowNotification(followedUserId, followerId) {
    return await this.createNotification(followedUserId, followerId, 'follow');
  }

  // Create like notification
  static async createLikeNotification(postAuthorId, likerId, postId) {
    return await this.createNotification(postAuthorId, likerId, 'like', postId);
  }

  // Create comment notification
  static async createCommentNotification(postAuthorId, commenterId, postId) {
    return await this.createNotification(postAuthorId, commenterId, 'comment', postId);
  }

  // Get notification count for user
  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ 
        user: userId, 
        isRead: false 
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;






