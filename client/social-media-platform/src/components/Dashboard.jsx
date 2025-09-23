import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useFetchUser from "../Hooks/useFetchUser";
import api from "../utils/axiosInstance";
import { getUserAvatarUrl } from "../utils/avatarUtils";
import CommentModal from "./CommentModal";
import PostModal from "./PostModal";

export default function Dashboard() {
    const { currentTheme } = useTheme();
    const { user } = useFetchUser();
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [showCommentModal, setShowCommentModal] = useState({ postId: null, isOpen: false });

    // Fetch real feed
    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get('/api/posts');
                const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                const normalized = data.map(p => ({
                    id: p._id,
                    user: {
                        name: p.author?.name || 'User',
                        username: p.author?.username ? `@${p.author.username}` : '@user',
                        avatar: getUserAvatarUrl(p.author)
                    },
                    content: p.caption,
                    image: Array.isArray(p.images) && p.images.length > 0 ? `${p.images[0].startsWith('http') ? '' : 'http://localhost:5000/'}${p.images[0]}` : null,
                    timestamp: new Date(p.createdAt).toLocaleString(),
                    likes: Array.isArray(p.likes) ? p.likes.length : 0,
                    comments: Array.isArray(p.comments) ? p.comments.length : 0,
                    shares: Array.isArray(p.shares) ? p.shares.length : 0,
                    liked: false
                }));
                setPosts(normalized);
            } catch (e) {
                console.error('Error fetching feed', e);
                setPosts([]);
            }
        };
        fetchFeed();
    }, []);

    const handleLike = async (postId) => {
        try {
            // Update UI optimistically
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        liked: !post.liked, 
                        likes: post.liked ? post.likes - 1 : post.likes + 1 
                      }
                    : post
            ));
            
            // Make API call to backend
            await api.put(`/api/posts/${postId}/like`);
        } catch (error) {
            console.error('Error liking post:', error);
            // Revert optimistic update on error
            setPosts(posts.map(post => 
                post.id === postId 
                    ? { 
                        ...post, 
                        liked: !post.liked, 
                        likes: post.liked ? post.likes + 1 : post.likes - 1 
                      }
                    : post
            ));
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await api.delete(`/api/posts/${postId}`);
            // Remove post from UI
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    };

    const PostCard = ({ post }) => {
        const isAuthor = user && post.user.username === `@${user.username}`;
        
        return (
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mb-6"
                style={{ backgroundColor: currentTheme.colors.surface }}
            >
                <div className="flex items-start space-x-4">
                    <img 
                        src={post.user.avatar} 
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                    />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                                    {post.user.name}
                                </h3>
                                <span className="text-gray-500 text-sm">{post.user.username}</span>
                                <span className="text-gray-400 text-sm">•</span>
                                <span className="text-gray-400 text-sm">{post.timestamp}</span>
                            </div>
                            {isAuthor && (
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Delete post"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    
                    <p className="mb-4 leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                        {post.content}
                    </p>
                    
                    {post.image && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                            <img 
                                src={post.image} 
                                alt="Post content"
                                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                post.liked 
                                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                        >
                            <span className="text-lg">{post.liked ? '❤️' : '🤍'}</span>
                            <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        
                        <button 
                            onClick={() => setShowCommentModal({ postId: post.id, isOpen: true })}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            <span className="text-lg">💬</span>
                            <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const CreatePostCard = () => (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme.colors.surface }}
        >
            <div className="flex items-start space-x-4">
                <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"} 
                    alt="Your avatar"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div className="flex-1">
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors"
                        style={{ 
                            backgroundColor: currentTheme.colors.background,
                            color: currentTheme.colors.textSecondary 
                        }}
                    >
                        What's on your mind, {user?.name || 'User'}?
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setShowPostModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    <span className="text-lg">📷</span>
                    <span className="text-sm font-medium">Photo</span>
                </button>
                
                <button 
                    onClick={() => setShowPostModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                >
                    <span className="text-lg">🎥</span>
                    <span className="text-sm font-medium">Video</span>
                </button>
                
                <button 
                    onClick={() => setShowPostModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                    <span className="text-lg">😊</span>
                    <span className="text-sm font-medium">Feeling</span>
                </button>
            </div>
        </div>
    );

    const TrendingCard = () => (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme.colors.surface }}
        >
            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
                🔥 Trending Now
            </h3>
            <div className="space-y-3">
                {['#ReactJS', '#WebDev', '#TechNews', '#Innovation', '#Startup'].map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                            {trend}
                        </span>
                        <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 1000) + 100} posts
                        </span>
                    </div>
                ))}
            </div>
            <Link to="/explore" className="inline-block mt-4 text-sm font-medium hover:underline" style={{ color: currentTheme.colors.primary }}>
                Explore more →
            </Link>
        </div>
    );

    const SuggestedFriends = () => (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            style={{ backgroundColor: currentTheme.colors.surface }}
        >
            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
                👥 Suggested Friends
            </h3>
            <div className="space-y-4">
                {[
                    { name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", mutual: 12 },
                    { name: "David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", mutual: 8 },
                    { name: "Lisa Park", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face", mutual: 15 }
                ].map((friend, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <img 
                            src={friend.avatar} 
                            alt={friend.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                                {friend.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {friend.mutual} mutual friends
                            </p>
                        </div>
                        <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors">
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="h-full" style={{ backgroundColor: currentTheme.colors.background }}>
            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Feed */}
                    <div className="lg:col-span-2">
                        <CreatePostCard />
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                    
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <TrendingCard />
                    </div>
                    
                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <SuggestedFriends />
                    </div>
                </div>
            </div>
            
            {showPostModal && (
                <PostModal 
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    onPost={(postData) => {
                        // Handle new post creation
                        console.log('New post:', postData);
                        setShowPostModal(false);
                    }}
                />
            )}
            
            {showCommentModal.isOpen && (
                <CommentModal 
                    isOpen={showCommentModal.isOpen}
                    onClose={() => setShowCommentModal({ postId: null, isOpen: false })}
                    postId={showCommentModal.postId}
                />
            )}
        </div>
    );
}