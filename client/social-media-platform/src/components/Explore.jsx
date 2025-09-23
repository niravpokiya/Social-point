import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import { getUserAvatarUrl } from "../utils/avatarUtils";
import UserDiscovery from "./UserDiscovery";

export default function Explore() {
    const { currentTheme } = useTheme();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    // Fetch all posts for explore (everyone's recent posts by date)
    useEffect(() => {
        const fetchExplorePosts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/posts');
                const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                
                // Sort by date (most recent first)
                const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                const normalized = sortedPosts.map(p => ({
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
                console.error('Error fetching explore posts', e);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchExplorePosts();
    }, []);

    const PostCard = ({ post }) => (
        <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            style={{ backgroundColor: currentTheme.colors.surface }}
        >
            <div className="flex items-center space-x-3 mb-4">
                <img 
                    src={post.user.avatar} 
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <Link 
                        to={`/profile/${post.user.username.replace('@', '')}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {post.user.name}
                    </Link>
                    <p className="text-xs text-gray-500">{post.user.username}</p>
                </div>
                <span className="text-xs text-gray-500">{post.timestamp}</span>
            </div>
            
            <p className="mb-4" style={{ color: currentTheme.colors.text }}>
                {post.content}
            </p>
            
            {post.image && (
                <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                />
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                    <span>❤️</span>
                    <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                    <span>💬</span>
                    <span>{post.comments}</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                    <span>🔄</span>
                    <span>{post.shares}</span>
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary }}></div>
                    <p style={{ color: currentTheme.colors.text }}>Loading explore posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
                        🔍 Explore
                    </h1>
                    <p className="text-gray-500">Discover posts and people on the platform</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'posts'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        style={{ 
                            color: activeTab === 'posts' ? currentTheme.colors.primary : currentTheme.colors.textSecondary 
                        }}
                    >
                        📝 Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('people')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'people'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                        style={{ 
                            color: activeTab === 'people' ? currentTheme.colors.primary : currentTheme.colors.textSecondary 
                        }}
                    >
                        👥 People
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'posts' ? (
                    posts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No posts to explore yet.</p>
                        </div>
                    ) : (
                        <div>
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )
                ) : (
                    <UserDiscovery />
                )}
            </div>
        </div>
    );
}
