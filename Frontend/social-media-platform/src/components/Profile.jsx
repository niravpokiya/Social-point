import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useFetchUser from "../Hooks/useFetchUser";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";
import PostModal from "./PostModal";
import PostViewModal from "./PostViewModal";
export default function Profile() {
  const { username } = useParams();
  const { user, loading, error } = useFetchUser(username);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const updatedUser = location.state?.updatedUser;
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [posts, setPosts] = useState([]);

  // ✅ Fetch posts only for this user by ID
  const fetchPosts = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/api/posts/user/${userId}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    }
  };

  // Initial fetch of posts after user resolved
  useEffect(() => {
    if (user?._id) fetchPosts(user._id);
  }, [user?._id]);

  // Decode token once and store logged-in user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUserId(decodedToken?.id);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const isOwnProfile = loggedInUserId === user?._id;
  
  // Check if the profile user is following the logged-in user
  const isFollowingMe = user?.following?.includes(loggedInUserId) || false;

  // Derived mutual friends list
  const getMutuals = () => {
    try {
      const followers = new Set(user?.followers?.map(String) || []);
      const following = new Set(user?.following?.map(String) || []);
      const mutual = [...followers].filter(id => following.has(id));
      return mutual.length;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    if (updatedUser) {
      setCurrentUser(updatedUser);
    } else if (user) {
      setCurrentUser(user);
    }

    if (user && loggedInUserId && loggedInUserId !== user._id) {
      setIsFollowing(user.followers.includes(loggedInUserId));
    }
  }, [user, updatedUser, loggedInUserId]);

  if (loading || !currentUser)
    return <div className="text-center text-white">Loading...</div>;
  if (error || !user)
    return <div className="text-center text-red-500">Error: {error}</div>;

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleFollowToggle = async () => {
    try {
      const res = await api.put(`/api/user/${user._id}/follow`, {});
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    // Remove the deleted post from the posts array
    setPosts(posts.filter(post => post._id !== deletedPostId));
  };

  const HandleMessageButtonClick = async () => {
    try {
      console.log("=== Message Button Debug ===");
      console.log("loggedInUserId (actual current user):", loggedInUserId);
      console.log("user (profile being viewed):", user);
      console.log("user._id:", user?._id);
      
      const senderId = loggedInUserId; // Use the actual logged-in user ID
      const receiverId = user?._id;    // Use the profile being viewed ID
      
      console.log("Sending conversation request with:");
      console.log("senderId:", senderId);
      console.log("receiverId:", receiverId);
      
      if (!senderId || !receiverId) {
        console.error("Missing user IDs:", { senderId, receiverId });
        return;
      }
      
      if (senderId === receiverId) {
        console.error("Cannot create conversation with yourself!");
        return;
      }

      const res = await axios.post("/api/chat/conversation", {
        senderId: senderId,
        receiverId: receiverId,
      });

      const conversation = res.data;
      console.log("Created/found conversation:", conversation);
      
      navigate(`/chat/${conversation._id}`, {
        state: { otherUser: user }, // pass otherUser info for display
      });
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  // ✅ SINGLE RETURN (fixed)
  return (
    <div className="min-h-screen">
      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={fetchPosts}
      />

      {/* Hero Section with Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 dark:from-gray-900/50 via-transparent to-transparent"></div>
        </div>

        {/* Profile Content Container */}
        <div className="relative -mt-12 z-10">
          <div className="max-w-3xl mx-auto px-6">
            {/* Main Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="relative">
                    {/* Simple avatar container */}
                    <div className="w-20 h-20 rounded-full border-3 border-white dark:border-gray-600 shadow-xl overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600">
                      <Avatar
                        user={currentUser}
                        size="w-full h-full"
                        className=""
                      />
                    </div>
                    
                    {/* Online Status */}
                    <div className="absolute bottom-0 right-0">
                      <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"></div>
                    </div>
                    
                    {/* Verification badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Profile Info Section */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="mb-3">
                    <h1 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">
                      {currentUser.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">@{currentUser.username}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">
                      {currentUser.bio || "Mr Cool"}
                    </p>
                  </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={handleEditProfile}
                        className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-white font-medium text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </span>
                      </button>
                      <button
                        onClick={() => setIsPostModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm rounded-lg transition-all duration-200 shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Post
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        className={`px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200 shadow-sm ${
                          isFollowing
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white`}
                      >
                        <span className="flex items-center gap-2">
                          {isFollowing ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                          {isFollowing ? "Following" : "Follow"}
                        </span>
                      </button>
                      <button 
                        className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-600 dark:text-white font-medium text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm"
                        onClick={HandleMessageButtonClick}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                          </span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">{posts.length}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Posts</div>
                    </div>
                    {(isOwnProfile || isFollowingMe) ? (
                      <Link to={`/profile/${user._id}/followers`} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 block">
                        <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">{user.followers.length}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Followers</div>
                      </Link>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50">
                        <div className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">🔒</div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Followers</div>
                      </div>
                    )}
                    {(isOwnProfile || isFollowingMe) ? (
                      <Link to={`/profile/${user._id}/following`} className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 block">
                        <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">{user.following.length}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Following</div>
                      </Link>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50">
                        <div className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">🔒</div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wide">Following</div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
                      <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">{getMutuals()}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Friends</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="max-w-3xl mx-auto px-6 pb-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <span className="text-2xl">📸</span>
            Posts Collection
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </div>
        </div>

        {Array.isArray(posts) && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={post._id}
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-2"
                onClick={() => setActivePost(post)}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Post Image */}
                {Array.isArray(post.images) && post.images.length > 0 ? (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={`${post.images[0].startsWith('http') ? '' : 'http://localhost:5000/'}${post.images[0]}`}
                      alt="Post"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    
                    {/* Image overlay content */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
                    <div className="text-center z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="text-white/80 text-sm font-medium">Text Post</div>
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <div className="p-6">
                  <p className="text-slate-300 leading-relaxed line-clamp-3 group-hover:text-white transition-colors duration-300 mb-4">
                    {post.caption || "No caption"}
                  </p>
                  
                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-2 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {post.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments?.length || 0}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-700/30 px-3 py-1 rounded-full">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-purple-600/20 group-hover:via-blue-600/20 group-hover:to-purple-600/20 transition-all duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
                <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600/30 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-3">No posts yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              {isOwnProfile 
                ? "Ready to share your story? Create your first post and let the world see what you're up to!" 
                : "This user hasn't shared any posts yet. Check back later for updates!"}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Post
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Post Modal */}
      <PostViewModal 
        post={activePost} 
        onClose={() => setActivePost(null)} 
        onPostDeleted={handlePostDeleted}
      />
    </div>
  );
}
