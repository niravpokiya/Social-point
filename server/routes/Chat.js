const router = require("express").Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create conversation (first time you chat with someone)
router.post("/conversation", async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    console.log("Creating conversation between:", senderId, "and", receiverId);
    
    // Check if conversation already exists (handle both string and ObjectId formats)
    let conv = await Conversation.findOne({
      $or: [
        { members: { $all: [senderId, receiverId] } }, // String format
        { members: { $all: [new mongoose.Types.ObjectId(senderId), new mongoose.Types.ObjectId(receiverId)] } } // ObjectId format
      ]
    });
    
    if (!conv) {
      // Create new conversation - use current format (ObjectId)
      const senderObjectId = mongoose.Types.ObjectId.isValid(senderId) ? new mongoose.Types.ObjectId(senderId) : senderId;
      const receiverObjectId = mongoose.Types.ObjectId.isValid(receiverId) ? new mongoose.Types.ObjectId(receiverId) : receiverId;
      
      conv = await Conversation.create({ 
        members: [senderObjectId, receiverObjectId] 
      });
      console.log("Created new conversation:", conv._id);
    } else {
      console.log("Found existing conversation:", conv._id);
    }
    
    res.status(200).json(conv);
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json(err);
  }
});

// Get all conversations for a user (MUST comme before single conversation route)
router.get("/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching conversations for user:", userId);
    
    // First, let's find all conversations and debug
    const allConversations = await Conversation.find({});
    console.log("All conversations in DB:", allConversations.length);
    allConversations.forEach((conv, index) => {
      console.log(`Conversation ${index}:`, {
        id: conv._id,
        members: conv.members,
        membersTypes: conv.members.map(m => typeof m)
      });
    });
    
    // Query for conversations with string user ID (most likely format based on your DB)
    const conversations = await Conversation.find({
      members: { $in: [userId] }
    });
    
    console.log(`Found ${conversations.length} conversations for user ${userId}`);
    
    if (conversations.length === 0) {
      console.log("No conversations found. Trying alternative query...");
      
      // Try with ObjectId conversion as backup
      try {
        const conversationsWithObjectId = await Conversation.find({
          members: { $in: [new mongoose.Types.ObjectId(userId)] }
        });
        console.log(`Found ${conversationsWithObjectId.length} conversations with ObjectId query`);
      } catch (objectIdErr) {
        console.log("ObjectId query failed:", objectIdErr.message);
      }
      
      return res.status(200).json([]);
    }
    
    const results = await Promise.all(
      conversations.map(async (conv) => {
        try {
          if (!conv.members || conv.members.length !== 2) {
            console.log("Invalid conversation members:", conv.members);
            return null;
          }

          // Find the other user ID (handle both string and ObjectId formats)
          const otherUserId = conv.members.find(
            (m) => m.toString() !== userId.toString()
          );

          console.log("Looking up user:", otherUserId);
          
          if (!otherUserId || otherUserId.toString() === userId.toString()) {
            console.log("Invalid other user ID or same as current user");
            return null;
          }
          
          // Try to find user by ID
          let otherUser;
          try {
            otherUser = await User.findById(otherUserId).select("username email name avatar");
          } catch (userFindErr) {
            console.log("Error finding user by ID:", userFindErr.message);
            otherUser = null;
          }
          
          if (!otherUser) {
            console.log("User not found for ID:", otherUserId);
            return {
              _id: conv._id,
              otherUser: { 
                username: "Deleted User", 
                email: "",
                _id: otherUserId 
              }
            };
          }

          console.log("Found user:", otherUser.username);
          return {
            _id: conv._id,
            otherUser: otherUser,
          };
        } catch (userErr) {
          console.error("Error processing conversation:", userErr);
          return {
            _id: conv._id,
            otherUser: { 
              username: "Error Loading User", 
              email: "",
              _id: "unknown"
            }
          };
        }
      })
    );

    const filteredResults = results.filter(r => r !== null);
    console.log(`Returning ${filteredResults.length} conversations`);
    res.status(200).json(filteredResults);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single conversation by ID
router.get("/conversation/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.status(200).json(conversation);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json(err);
  }
});


// Add a message
router.post("/message", async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;
    
    // Convert to ObjectIds if needed
    const convObjectId = mongoose.Types.ObjectId.isValid(conversationId) ? conversationId : new mongoose.Types.ObjectId(conversationId);
    const senderObjectId = mongoose.Types.ObjectId.isValid(sender) ? sender : new mongoose.Types.ObjectId(sender);
    
    const newMessage = await Message.create({
      conversationId: convObjectId,
      sender: senderObjectId,
      text
    });
    
    res.status(200).json(newMessage);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json(err);
  }
});

// DEBUG: Get all conversations (for debugging)
router.get("/debug/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find({});
    console.log("All conversations:", conversations);
    
    // Also get all users for reference
    const users = await User.find({}).select("username email _id");
    console.log("All users:", users);
    
    res.status(200).json({
      conversations: conversations,
      users: users
    });
  } catch (err) {
    console.error("Error fetching all conversations:", err);
    res.status(500).json(err);
  }
});

// DEBUG: Clean up duplicate conversations
router.post("/debug/cleanup", async (req, res) => {
  try {
    const conversations = await Conversation.find({});
    let cleaned = 0;
    
    for (const conv of conversations) {
      if (conv.members && conv.members.length === 2) {
        const [member1, member2] = conv.members;
        if (member1.toString() === member2.toString()) {
          console.log("Deleting invalid conversation with duplicate members:", conv._id);
          await Conversation.findByIdAndDelete(conv._id);
          cleaned++;
        }
      }
    }
    
    res.status(200).json({ message: `Cleaned up ${cleaned} invalid conversations` });
  } catch (err) {
    console.error("Error cleaning conversations:", err);
    res.status(500).json(err);
  }
});

// Get all messages in a conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
