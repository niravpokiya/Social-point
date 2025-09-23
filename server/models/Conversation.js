// models/Conversation.js
const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }], // Array of user ObjectIds
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
