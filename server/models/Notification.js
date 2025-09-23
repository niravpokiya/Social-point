const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receiver
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who performed action
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional (for likes/comments)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
