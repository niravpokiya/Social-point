import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../Hooks/useNotifications';
import Avatar from './Avatar';

export default function Notifications() {
    const { currentTheme } = useTheme();
    const { 
        notifications, 
        loading, 
        unreadCount, 
        fetchNotifications, 
        markAllAsRead 
    } = useNotifications();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const formatTimeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return notificationDate.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return (
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'comment':
                return (
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                );
            case 'follow':
                return (
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                        </svg>
                    </div>
                );
        }
    };

    const getNotificationMessage = (notification) => {
        const senderName = notification.sender?.name || 'Someone';
        switch (notification.type) {
            case 'like':
                return `${senderName} liked your post`;
            case 'comment':
                return `${senderName} commented on your post`;
            case 'follow':
                return `${senderName} started following you`;
            default:
                return 'You have a new notification';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'like':
                return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
            case 'comment':
                return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'follow':
                return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
            default:
                return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-sm font-medium rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    
                    {/* Mark all as read button */}
                    {notifications.length > 0 && unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications Content */}
                <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                            <span className="ml-3 text-gray-400 text-lg">Loading notifications...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                                </svg>
                            </div>
                            <p className="text-gray-300 text-xl font-medium mb-2">No notifications yet</p>
                            <p className="text-gray-500 text-sm">You'll see notifications here when people interact with your content</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {notifications.map((notification, index) => (
                                <div 
                                    key={notification._id} 
                                    className={`p-6 transition-all duration-200 hover:bg-gray-750 ${
                                        !notification.isRead ? 'bg-gray-750 border-l-4 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-4">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <Avatar
                                                    user={notification.sender}
                                                    size="w-8 h-8"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-white font-medium">
                                                        {notification.sender?.name || 'User'}
                                                    </span>
                                                    {notification.sender?.isVerified && (
                                                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-gray-400 text-sm">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300">
                                                {getNotificationMessage(notification)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}