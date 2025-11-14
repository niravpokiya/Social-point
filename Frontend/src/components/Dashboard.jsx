import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import useFetchUser from "../Hooks/useFetchUser";
import { getUserAvatarUrl } from "../utils/avatarUtils";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";
import CommentModal from "./CommentModal";
import PostModal from "./PostModal";

export default function Dashboard() {
    const { currentTheme } = useTheme();
    const { user } = useFetchUser();
    const [posts, setPosts] = useState([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [showCommentModal, setShowCommentModal] = useState({ postId: null, isOpen: false });
    const [suggestedFriends, setSuggestedFriends] = useState([]);

    // Fetch real feed - only from users being followed
    useEffect(() => {
        const fetchFeed = async () => {
            if (!user?.following) return; // Wait for user data to load
            
            try {
                const res = await api.get('/api/posts');
                const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                
                // Filter posts to only show from followed users + own posts
                const filteredData = data.filter(p => {
                    const authorId = p.author?._id || p.author;
                    const isOwnPost = authorId === user._id;
                    const isFromFollowedUser = user.following.some(followedId => {
                        // Handle both string IDs and object IDs
                        const followedUserId = typeof followedId === 'object' ? followedId._id : followedId;
                        return followedUserId === authorId;
                    });
                    return isOwnPost || isFromFollowedUser;
                });
                
                const normalized = filteredData.map(p => ({
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
                
                // Sort by creation date (most recent first)
                normalized.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                setPosts(normalized);
            } catch (e) {
                console.error('Error fetching feed', e);
                setPosts([]);
            }
        };
        fetchFeed();
    }, [user]); // Re-run when user data changes

    // Fetch suggested friends
    useEffect(() => {
        const fetchSuggestedFriends = async () => {
            if (!user?._id) return;
            
            try {
                let suggestions = [];
                
                // First, try to get followers of people the user follows
                if (user.following && user.following.length > 0) {
                    // Get followers of the first few people the user follows
                    for (let i = 0; i < Math.min(3, user.following.length); i++) {
                        try {
                            const followedUserId = user.following[i];
                            const response = await api.get(`/api/user/${followedUserId}/followers`);
                            const followers = response.data || [];
                            
                            // Filter out the current user and people they already follow
                            const filtered = followers.filter(person => 
                                person._id !== user._id && 
                                !user.following.includes(person._id)
                            );
                            
                            suggestions = [...suggestions, ...filtered];
                        } catch (err) {
                            // Skip if can't access this user's followers (privacy)
                            continue;
                        }
                    }
                }
                
                // If we don't have enough suggestions, get random users
                if (suggestions.length < 3) {
                    try {
                        const response = await api.get('/api/user/discover');
                        const randomUsers = response.data || [];
                        
                        // Filter out current user and people they already follow
                        const filtered = randomUsers.filter(person => 
                            person._id !== user._id && 
                            !user.following?.includes(person._id) &&
                            !suggestions.some(s => s._id === person._id) // Avoid duplicates
                        );
                        
                        suggestions = [...suggestions, ...filtered];
                    } catch (err) {
                        console.error('Error fetching random users:', err);
                    }
                }
                
                // Limit to 4 suggestions and add mutual friends count
                const finalSuggestions = suggestions.slice(0, 4).map(person => ({
                    ...person,
                    mutualFriends: calculateMutualFriends(person, user)
                }));
                
                setSuggestedFriends(finalSuggestions);
            } catch (error) {
                console.error('Error fetching suggested friends:', error);
                setSuggestedFriends([]);
            }
        };

        fetchSuggestedFriends();
    }, [user]);

    // Calculate mutual friends count
    const calculateMutualFriends = (person, currentUser) => {
        if (!person.followers || !currentUser.following) return 0;
        
        const personFollowers = new Set(person.followers.map(f => f._id || f));
        const userFollowing = new Set(currentUser.following.map(f => f._id || f));
        
        let mutualCount = 0;
        for (let follower of personFollowers) {
            if (userFollowing.has(follower)) {
                mutualCount++;
            }
        }
        return mutualCount;
    };

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

    const handleFollowSuggestion = async (userId) => {
        try {
            await api.put(`/api/user/${userId}/follow`);
            
            // Remove the followed user from suggestions
            setSuggestedFriends(suggestedFriends.filter(friend => friend._id !== userId));
            
            // You might want to update the user's following list here
            // and trigger a re-fetch of suggestions
        } catch (error) {
            console.error('Error following user:', error);
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
                    src={getUserAvatarUrl(user)} 
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
                {suggestedFriends.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No suggestions available
                        </p>
                    </div>
                ) : (
                    suggestedFriends.map((friend, index) => (
                        <div key={friend._id || index} className="flex items-center space-x-3">
                            <Link to={`/profile/${friend.username}`} className="flex-shrink-0">
                                <Avatar 
                                    user={friend} 
                                    size="w-10 h-10"
                                    className="rounded-full hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                                />
                            </Link>
                            <div className="flex-1">
                                <Link 
                                    to={`/profile/${friend.username}`}
                                    className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" 
                                    style={{ color: currentTheme.colors.text }}
                                >
                                    {friend.name}
                                </Link>
                                <p className="text-xs text-gray-500">
                                    {friend.mutualFriends > 0 
                                        ? `${friend.mutualFriends} mutual friends`
                                        : `@${friend.username}`
                                    }
                                </p>
                            </div>
                            <button 
                                onClick={() => handleFollowSuggestion(friend._id)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                            >
                                Follow
                            </button>
                        </div>
                    ))
                )}
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