const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  caption: {
    type: String,
    trim: true,
    maxlength: [1000, 'Caption cannot exceed 1000 characters'],
    default: ""
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for share count
PostSchema.virtual('shareCount').get(function() {
  return this.shares ? this.shares.length : 0;
});

// Indexes for better performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ 'location.coordinates': '2dsphere' });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ visibility: 1 });

// Pre-save middleware to update updatedAt
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to extract hashtags
PostSchema.pre('save', function(next) {
  if (this.isModified('caption')) {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const hashtags = this.caption.match(hashtagRegex);
    if (hashtags) {
      this.tags = [...new Set(hashtags.map(tag => tag.toLowerCase()))];
    }
  }
  next();
});

// Instance method to check if user liked the post
PostSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.toString() === userId.toString());
};

// Instance method to toggle like
PostSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    return false; // unliked
  } else {
    this.likes.push(userId);
    return true; // liked
  }
};

// Static method to get feed posts
PostSchema.statics.getFeedPosts = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    visibility: { $in: ['public', 'friends'] },
    isArchived: false
  })
  .populate('author', 'name username avatar isVerified')
  .populate('likes', 'name username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get posts from following users
PostSchema.statics.getFollowingPosts = function(followingIds, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    author: { $in: followingIds },
    visibility: { $in: ['public', 'friends'] },
    isArchived: false
  })
  .populate('author', 'name username avatar isVerified')
  .populate('likes', 'name username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get posts by user
PostSchema.statics.getUserPosts = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    author: userId,
    isArchived: false
  })
  .populate('author', 'name username avatar isVerified')
  .populate('likes', 'name username avatar')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to search posts
PostSchema.statics.searchPosts = function(searchTerm, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { caption: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    visibility: 'public',
    isArchived: false
  })
  .populate('author', 'name username avatar isVerified')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Post', PostSchema);
