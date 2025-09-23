import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../Hooks/useNotifications';
import { getUserAvatarUrl } from '../utils/avatarUtils';

export default function NotificationModal({ isOpen, onClose }) {
    const { currentTheme } = useTheme();
    const { 
        notifications, 
        loading, 
        unreadCount, 
        fetchNotifications, 
        markAllAsRead 
    } = useNotifications();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

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

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: currentTheme.colors.surface }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            <span className="ml-3 text-gray-500">Loading notifications...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No notifications yet</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You'll see notifications here when people interact with your content</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification._id} 
                                    className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type)}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <img
                                                    src={getUserAvatarUrl(notification.sender)}
                                                    alt={notification.sender?.name || 'User'}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span className="text-sm font-medium" style={{ color: currentTheme.colors.text }}>
                                                    {notification.sender?.name || 'User'}
                                                </span>
                                                {notification.sender?.isVerified && (
                                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                                                {getNotificationMessage(notification)}
                                            </p>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTimeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && unreadCount > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <button
                            onClick={markAllAsRead}
                            className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
