const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/Post");
const authMiddleware = require("../middlewares/AuthMiddleware");

// Configure multer to store files in "uploads" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get all posts (feed)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await Post.getFeedPosts(null, page, limit);
    res.json({
      success: true,
      data: posts,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching posts", 
      error: err.message 
    });
  }
});

// Get posts from following users (home feed)
router.get("/following", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get current user's following list
    const User = require("../models/User");
    const user = await User.findById(req.user.id).select('following');
    
    if (!user || !user.following || user.following.length === 0) {
      return res.json({
        success: true,
        data: [],
        page,
        limit,
        message: "No following users found"
      });
    }
    
    const posts = await Post.getFollowingPosts(user.following, page, limit);
    res.json({
      success: true,
      data: posts,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching following posts", 
      error: err.message 
    });
  }
});

// Create Post
router.post("/create", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one image is required" 
      });
    }
    
    // Save file paths relative to server
    const imagePaths = req.files.map((file) => file.path);

    const newPost = new Post({
      caption,
      images: imagePaths,
      author: req.user.id,
    });

    await newPost.save();
    
    // Populate author info
    await newPost.populate('author', 'name username avatar isVerified');
    
    res.status(201).json({
      success: true,
      data: newPost
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: "Error creating post", 
      error: err.message 
    });
  }
});

// Like/Unlike Post
router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const isLiked = post.toggleLike(req.user.id);
    await post.save();
 
    if (isLiked) {
      const NotificationService = require('../services/NotificationService');
      await NotificationService.createLikeNotification(post.author.toString(), req.user.id, req.params.id);
    }

    res.json({
      success: true,
      data: {
        isLiked,
        likeCount: post.likeCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating like",
      error: err.message
    });
  }
});

// Get posts by user
router.get("/user/:userId", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await Post.getUserPosts(req.params.userId, page, limit);
    res.json({
      success: true,
      data: posts,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
      error: err.message
    });
  }
});

// Add comment to post
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required"
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Create a new Comment document
    const Comment = require("../models/Comment");
    const newComment = new Comment({
      post: req.params.id,
      content: content.trim(),
      author: req.user.id
    });

    await newComment.save();

    // Add comment reference to post
    post.comments.push(newComment._id);
    await post.save();

    // Create comment notification
    const NotificationService = require('../services/NotificationService');
    await NotificationService.createCommentNotification(post.author.toString(), req.user.id, req.params.id);

    // Populate author info for the new comment
    await newComment.populate('author', 'name username avatar');
    
    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: err.message
    });
  }
});

// Get comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const Comment = require("../models/Comment");
    
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: comments || []
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: err.message
    });
  }
});

// Delete Post
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts"
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: err.message
    });
  }
});

module.exports = router;
