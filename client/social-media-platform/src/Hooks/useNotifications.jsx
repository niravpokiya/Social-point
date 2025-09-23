import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosInstance';

export const useNotifications = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await api.get('/api/notifications/unread-count');
            setUnreadCount(res.data.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.put('/api/notifications/mark-all-read');
            setUnreadCount(0);
            // Update notifications to show as read
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(notif => 
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Fetch unread count on mount and set up polling
    useEffect(() => {
        fetchUnreadCount();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return {
        unreadCount,
        notifications,
        loading,
        fetchUnreadCount,
        fetchNotifications,
        markAllAsRead,
        markAsRead
    };
};







