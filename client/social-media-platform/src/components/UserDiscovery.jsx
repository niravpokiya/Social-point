import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";

export default function UserDiscovery() {
    const { currentTheme } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [following, setFollowing] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Get current user
                const userRes = await api.get('/api/user/me');
                setCurrentUser(userRes.data);
                
                // Get all users (excluding current user)
                const usersRes = await api.get('/api/user/discover');
                const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
                setUsers(allUsers.filter(user => user._id !== userRes.data._id));
                
                // Get current user's following list
                const followingRes = await api.get(`/api/user/${userRes.data._id}/following`);
                const followingList = Array.isArray(followingRes.data) ? followingRes.data : [];
                setFollowing(new Set(followingList.map(user => user._id)));
            } catch (e) {
                console.error('Error fetching users', e);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFollowToggle = async (userId) => {
        try {
            const isFollowing = following.has(userId);
            
            // Update UI optimistically
            if (isFollowing) {
                setFollowing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            } else {
                setFollowing(prev => new Set([...prev, userId]));
            }
            
            // Make API call
            await api.put(`/api/user/${userId}/follow`);
        } catch (error) {
            console.error('Error toggling follow:', error);
            // Revert optimistic update on error
            const isFollowing = following.has(userId);
            if (isFollowing) {
                setFollowing(prev => new Set([...prev, userId]));
            } else {
                setFollowing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            }
        }
    };

    const UserCard = ({ user }) => {
        const isFollowing = following.has(user._id);
        
        return (
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-4"
                style={{ backgroundColor: currentTheme.colors.surface }}
            >
                <div className="flex items-center space-x-4">
                    <Avatar 
                        user={user}
                        size="w-16 h-16"
                        alt={user.name}
                    />
                    <div className="flex-1">
                        <Link 
                            to={`/profile/${user.username}`}
                            className="text-lg font-semibold hover:underline block"
                            style={{ color: currentTheme.colors.text }}
                        >
                            {user.name}
                        </Link>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        {user.bio && (
                            <p className="text-sm mt-1" style={{ color: currentTheme.colors.textSecondary }}>
                                {user.bio}
                            </p>
                        )}
                        {user.isVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                ✓ Verified
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <button 
                            onClick={() => handleFollowToggle(user._id)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                isFollowing 
                                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <Link 
                            to={`/profile/${user.username}`}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                            style={{ color: currentTheme.colors.text }}
                        >
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.background }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: currentTheme.colors.primary }}></div>
                    <p style={{ color: currentTheme.colors.text }}>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
                        👥 Discover People
                    </h1>
                    <p className="text-gray-500">Find and connect with people on the platform</p>
                </div>
                
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
                            No users to discover
                        </h3>
                        <p className="text-gray-500">
                            Check back later for new users to follow!
                        </p>
                    </div>
                ) : (
                    <div>
                        {users.map(user => (
                            <UserCard key={user._id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
