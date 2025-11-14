# Social-Point 🚀

A modern, mesmerizing social media platform built with React, Node.js, and MongoDB. Features a beautiful theme system with multiple color schemes and a responsive design.

## ✨ Features

### Frontend
- **🎨 Dynamic Theme System**: 5 beautiful themes (Light, Dark, Purple, Ocean, Sunset)
- **📱 Responsive Design**: Works perfectly on all devices
- **🔥 Modern UI Components**: Beautiful cards, animations, and interactions
- **⚙️ Comprehensive Settings**: Theme customization, notifications
- **📝 Social Feed**: Like, comment, share posts with real-time updates
- **👥 User Management**: Profile pages, friend suggestions, user search
- **🔐 Authentication**: Secure login/register with form validation

### Backend
- **🛡️ Security**: rate limiting, CORS protection
- **📊 Enhanced Models**: User preferences, post analytics, virtual fields
- **🔧 API Routes**: RESTful APIs for all features
- **💾 Database**: MongoDB with optimized indexes and relationships
- **📁 File Upload**: Image handling with Multer
- **🔑 JWT Authentication**: Secure token-based authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/niravpokiya/Social-point
   cd mernproject
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client/social-media-platform
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/social-point
   JWT_SECRET=your-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   cd client/social-media-platform
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎨 Theme System

Social-Point features a comprehensive theme system with 5 beautiful themes:

### Available Themes
- **Light**: Clean and bright interface
- **Dark**: Modern dark mode (default)
- **Purple**: Vibrant purple gradient theme
- **Ocean**: Calming blue ocean theme
- **Sunset**: Warm orange sunset theme

### Theme Features
- Real-time theme switching
- Persistent theme storage
- Smooth transitions between themes
- Custom CSS variables for easy customization

## 📁 Project Structure

```
mernproject/
├── Frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/            # React context (Theme, User)
│   │   ├── Layout/             # Layout components
│   │   ├── Hooks/              # Custom hooks
│   │   └── utils/              # Utility functions
│   └── package.json
├── Backend/
│   ├── controllers/                # Route controllers
│   ├── models/                     # MongoDB models
│   ├── routes/                     # API routes
│   ├── middlewares/                # Custom middlewares
│   ├── uploads/                    # File uploads
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/search` - Search users

### Posts
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post

### Settings
- `GET /api/settings` - Get user settings
- `PATCH /api/settings/theme` - Update theme
- `PATCH /api/settings/notifications` - Update notifications
- `PATCH /api/settings/privacy` - Update privacy settings

## 🛠️ Technologies Used

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

## 🎯 Key Features

### User Experience
- **Smooth Animations**: CSS transitions and transforms
- **Loading States**: Beautiful loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback
- **Responsive Design**: Mobile-first approach

### Performance
- **Optimized Queries**: Database indexes and efficient queries
- **Image Optimization**: Compressed image uploads
- **Lazy Loading**: Component-based code splitting
- **Caching**: Browser and server-side caching

### Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side validation
 

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
 