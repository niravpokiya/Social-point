const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const path = require('path');
const http = require('http');              // Needed for socket.io
const { Server } = require('socket.io');   // socket.io

// Routes
const authRoutes = require('./routes/Auth');
const userRoutes = require("./routes/UserRoutes");
const postRoutes = require("./routes/Post");
const chatRoutes = require("./routes/Chat"); 

const app = express();
const server = http.createServer(app); // Create server from Express
 
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.',
});
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", limiter);
}

// db
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/settings", require('./routes/Settings'));
app.use("/api/notifications", require('./routes/Notification'));
app.use("/api/chat", chatRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // Add user to online users
  socket.on("addUser", (userId) => {
    if (!onlineUsers.some(u => u.userId === userId)) {
      onlineUsers.push({ userId, socketId: socket.id });
    }
    io.emit("getUsers", onlineUsers);
  });

  // Send message
  socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
    const user = onlineUsers.find(u => u.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        sender: senderId,
        text,
        conversationId,
        createdAt: new Date()
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
    io.emit("getUsers", onlineUsers);
    console.log("❌ User disconnected:", socket.id);
  });
});
 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
