import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import useFetchUser from "../Hooks/useFetchUser";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";
import CommentModal from "./CommentModal";

export default function PostViewModal({ post, onClose, onPostDeleted }) {
  // Early return before any hooks are called
  if (!post) return null;

  const { currentTheme } = useTheme();
  const { user } = useFetchUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentComments, setRecentComments] = useState([]);

  const imageUrl = Array.isArray(post.images) && post.images.length > 0
    ? `${post.images[0].startsWith('http') ? '' : 'http://localhost:5000/'}${post.images[0]}`
    : null;

  const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
  const authorName = post.author?.name || 'User';
  const authorUsername = post.author?.username ? `@${post.author.username}` : '@user';
  
  // Check if current user is the author of the post
  const isAuthor = user && post.author?._id === user._id;

  // Initialize like state and counts
  useEffect(() => {
    if (post) {
      setLikeCount(post.likes?.length || 0);
      setCommentCount(post.comments?.length || 0);
      
      // Check if current user has liked this post
      if (user && post.likes) {
        setIsLiked(post.likes.some(like => like._id === user._id || like === user._id));
      }
    }
  }, [post, user]);

  // Fetch recent comments when modal opens
  useEffect(() => {
    const fetchRecentComments = async () => {
      if (post?._id) {
        try {
          const response = await api.get(`/api/posts/${post._id}/comments`);
          const comments = response.data.data || [];
          setRecentComments(comments.slice(0, 3)); // Show only 3 recent comments
        } catch (error) {
          console.error('Error fetching recent comments:', error);
        }
      }
    };

    if (post) {
      fetchRecentComments();
    }
  }, [post]);

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await api.delete(`/api/posts/${post._id}`);
      onClose(); // Close the modal
      if (onPostDeleted) {
        onPostDeleted(post._id); // Notify parent component to remove post from list
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like posts');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/api/posts/${post._id}/like`);
      setIsLiked(response.data.data.isLiked);
      setLikeCount(response.data.data.likeCount);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = () => {
    if (!user) {
      alert('Please login to comment');
      return;
    }
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    // Refresh comment count when a new comment is added
    setCommentCount(prev => prev + 1);
    // Refresh recent comments
    const fetchRecentComments = async () => {
      try {
        const response = await api.get(`/api/posts/${post._id}/comments`);
        const comments = response.data.data || [];
        setRecentComments(comments.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent comments:', error);
      }
    };
    fetchRecentComments();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-900 text-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Avatar user={post.author} size="w-full h-full" />
            </div>
            <div>
              <div className="text-sm font-semibold">{authorName}</div>
              <div className="text-xs text-gray-400">{authorUsername}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <button 
                onClick={handleDeletePost}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                title="Delete post"
              >
                🗑️ Delete
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700">✕</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-black">
            {imageUrl ? (
              <img src={imageUrl} alt="Post" className="w-full h-[60vh] md:h-[70vh] object-contain bg-black" />
            ) : (
              <div className="w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="text-sm text-gray-400">{createdAt}</div>
            <div className="text-base whitespace-pre-wrap">{post.caption}</div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={handleLike}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg 
                    className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                )}
                <span className="font-medium">{likeCount}</span>
              </button>

              <button
                onClick={handleCommentClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                  />
                </svg>
                <span className="font-medium">{commentCount}</span>
              </button>
            </div>

            {/* Recent Comments Preview */}
            {recentComments.length > 0 && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Comments</h4>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {recentComments.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3">
                      <Avatar 
                        user={comment.author}
                        size="w-6 h-6"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-300">
                            {comment.author?.name || 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {commentCount > 3 && (
                  <button
                    onClick={handleCommentClick}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                  >
                    View all {commentCount} comments
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post._id}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}




