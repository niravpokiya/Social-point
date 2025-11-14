import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getUserAvatarUrl } from "../utils/avatarUtils";
import api from "../utils/axiosInstance";
import CommentModal from "./CommentModal";
import PostViewModal from "./PostViewModal";

export default function Explore() {
    const { currentTheme } = useTheme();
    const [posts, setPosts] = useState([]);
    const [originalPosts, setOriginalPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCommentModal, setShowCommentModal] = useState({ postId: null, isOpen: false });
    const [showPostModal, setShowPostModal] = useState({ post: null, isOpen: false });

    // Fetch all posts for explore (everyone's recent posts by date)
    useEffect(() => {
        const fetchExplorePosts = async () => {
            try {
                setLoading(true);
                const res = await api.get('/api/posts');
                const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                
                // Sort by date (most recent first)
                const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Store original posts for modal use
                setOriginalPosts(sortedPosts);
                
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

    const handleLike = async (postId) => {
        try {
            const response = await api.post(`/api/posts/${postId}/like`);
            
            // Update the post in the local state
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        liked: !post.liked,
                        likes: post.liked ? post.likes - 1 : post.likes + 1
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = (postId) => {
        setShowCommentModal({ postId, isOpen: true });
    };

    const handlePostClick = (post) => {
        // Find the original post data using the post ID
        const originalPost = originalPosts.find(p => p._id === post.id);
        setShowPostModal({ post: originalPost || post, isOpen: true });
    };

    const PostCard = ({ post }) => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
                <img 
                    src={post.user.avatar} 
                    alt={post.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                    <Link 
                        to={`/profile/${post.user.username.replace('@', '')}`}
                        className="text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {post.user.name}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.user.username}</p>
                </div>
                <span className="text-xs text-gray-400">{post.timestamp}</span>
            </div>
            
            {/* Post Content - Clickable */}
            <div 
                onClick={() => handlePostClick(post)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg p-2 -m-2 mb-2"
            >
                <p className="mb-4 text-gray-800 dark:text-gray-200" style={{ color: currentTheme.colors.text }}>
                    {post.content}
                </p>
                
                {/* Post Image */}
                {post.image && (
                    <img 
                        src={post.image} 
                        alt="Post" 
                        className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                )}
            </div>
            
            {/* Engagement Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
                <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 transition-colors ${post.liked ? 'text-red-500' : 'hover:text-red-500'}`}
                >
                    <span>{post.liked ? '❤️' : '🤍'}</span>
                    <span>{post.likes}</span>
                </button>
                <button 
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                >
                    <span>�</span>
                    <span>{post.comments}</span>
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Simple Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        🔍 Explore
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Discover posts from the community</p>
                </div>

                {/* Posts Content */}
                {posts.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No posts to explore yet</p>
                        <Link 
                            to="/home" 
                            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Go to Home
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Comment Modal */}
            {showCommentModal.isOpen && (
                <CommentModal 
                    isOpen={showCommentModal.isOpen}
                    onClose={() => setShowCommentModal({ postId: null, isOpen: false })}
                    postId={showCommentModal.postId}
                />
            )}

            {/* Post View Modal */}
            {showPostModal.isOpen && (
                <PostViewModal 
                    isOpen={showPostModal.isOpen}
                    onClose={() => setShowPostModal({ post: null, isOpen: false })}
                    post={showPostModal.post}
                />
            )}
        </div>
    );
}
