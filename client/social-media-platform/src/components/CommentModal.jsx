import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/axiosInstance';
import Avatar from './Avatar';

export default function CommentModal({ isOpen, onClose, postId, onCommentAdded }) {
    const { currentTheme } = useTheme();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingComments, setFetchingComments] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchComments();
        }
    }, [isOpen, postId]);

    const fetchComments = async () => {
        setFetchingComments(true);
        try {
            const res = await api.get(`/api/posts/${postId}/comments`);
            console.log('Comments response:', res.data);
            setComments(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
        } finally {
            setFetchingComments(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const res = await api.post(`/api/posts/${postId}/comments`, {
                content: newComment.trim()
            });
            console.log('Comment posted:', res.data);
            setNewComment('');
            fetchComments(); // Refresh comments
            if (onCommentAdded) {
                onCommentAdded(); // Notify parent component
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffInSeconds = Math.floor((now - commentDate) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return commentDate.toLocaleDateString();
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
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: currentTheme.colors.surface }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Comments
                        </h3>
                        {comments.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                                {comments.length}
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

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {fetchingComments ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-500">Loading comments...</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No comments yet</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment._id} className="group">
                                <div className="flex space-x-4">
                                    <div className="relative">
                                        <Avatar
                                            user={comment.author}
                                            size="w-10 h-10"
                                            className="ring-2 ring-gray-200 dark:ring-gray-700"
                                        />
                                        {comment.author?.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-md p-4 relative">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-semibold text-sm" style={{ color: currentTheme.colors.text }}>
                                                    {comment.author?.name || 'User'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTimeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.textSecondary }}>
                                                {comment.content}
                                            </p>
                                            {/* Comment actions */}
                                            <div className="flex items-center space-x-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d    ="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <span>Like</span>
                                                </button>
                                                <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span>Reply</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Form */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <form onSubmit={handleSubmitComment} className="flex space-x-3">
                        <Avatar
                            user={{ avatar: localStorage.getItem('userAvatar') }}
                            size="w-10 h-10"
                            className="ring-2 ring-gray-200 dark:ring-gray-700"
                            alt="Your avatar"
                        />
                        <div className="flex-1 relative">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                style={{ 
                                    backgroundColor: currentTheme.colors.background,
                                    color: currentTheme.colors.text 
                                }}
                                rows="2"
                            />
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
