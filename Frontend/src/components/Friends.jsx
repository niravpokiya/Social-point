import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";

export default function Friends() {
    const { currentTheme } = useTheme();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true);
                
                // Get current user first
                const userRes = await api.get('/api/user/me');
                const userData = userRes.data;
                setCurrentUser(userData);
                
                // Get user's following and followers lists
                const [followingRes, followersRes] = await Promise.all([
                    api.get(`/api/user/${userData._id}/following`),
                    api.get(`/api/user/${userData._id}/followers`)
                ]);
                
                const following = Array.isArray(followingRes.data) ? followingRes.data : [];
                const followers = Array.isArray(followersRes.data) ? followersRes.data : [];
                
                // Find mutual friends (people who follow you AND you follow them)
                const mutualFriends = following.filter(followedUser => {
                    return followers.some(follower => {
                        const followerId = follower._id || follower;
                        const followedId = followedUser._id || followedUser;
                        return followerId === followedId;
                    });
                });
                
                setFriends(mutualFriends);
            } catch (e) {
                console.error('Error fetching friends', e);
                // If there's an error (like privacy restrictions), show following list as fallback
                try {
                    const userRes = await api.get('/api/user/me');
                    setCurrentUser(userRes.data);
                    const followingRes = await api.get(`/api/user/${userRes.data._id}/following`);
                    setFriends(Array.isArray(followingRes.data) ? followingRes.data : []);
                } catch (fallbackError) {
                    console.error('Fallback error:', fallbackError);
                    setFriends([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    // Filter friends based on search term
    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMessage = async (friend) => {
        try {
            // Create or get conversation
            const response = await api.post('/api/chat/conversation', {
                senderId: currentUser._id,
                receiverId: friend._id
            });
            
            navigate(`/chat/${response.data._id}`, {
                state: { otherUser: friend }
            });
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const FriendCard = ({ friend }) => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="relative">
                {/* Background Gradient */}
                <div className="h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
                
                {/* Avatar Section */}
                <div className="relative px-6 pb-6">
                    <div className="absolute -top-12 left-6">
                        <div className="relative">
                            <Avatar 
                                user={friend}
                                size="w-20 h-20"
                                className="border-4 border-white dark:border-gray-800 shadow-lg"
                            />
                            {friend.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="pt-10">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <Link 
                                    to={`/profile/${friend.username}`}
                                    className="text-lg font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors block group-hover:text-blue-600"
                                    style={{ color: currentTheme.colors.text }}
                                >
                                    {friend.name}
                                </Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{friend.username}</p>
                                
                                {friend.bio && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                        {friend.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            <Link 
                                to={`/profile/${friend.username}`}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-center transform hover:scale-105 shadow-lg"
                            >
                                View Profile
                            </Link>
                            <button 
                                onClick={() => handleMessage(friend)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
                            >
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your friends...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-4 lg:mb-0">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                👥 Friends
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {friends.length} mutual {friends.length === 1 ? 'friend' : 'friends'} (follow each other)
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search friends..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full sm:w-56 pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Friends Content */}
                {filteredFriends.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                            {searchTerm ? "No friends found" : "No friends yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                            {searchTerm 
                                ? `No friends match "${searchTerm}". Try a different search term.`
                                : "No mutual friends yet. Friends are people who follow you back!"
                            }
                        </p>
                        {!searchTerm && (
                            <Link 
                                to="/explore"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Discover People
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFriends.map(friend => (
                            <FriendCard key={friend._id} friend={friend} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
