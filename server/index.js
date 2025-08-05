const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authMiddleware = require('./middlewares/AuthMiddleware');
require('dotenv').config();
const User = require('./models/User');
const authRoutes = require('./routes/Auth');
const userRoutes = require("./routes/UserRoutes");
const path = require('path');
const app = express();
// app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    credentials: true, // allowing sending cookies
  })
);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// auth
app.use('/api/auth', authRoutes);

// getting current user
app.use("/api/user", userRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));