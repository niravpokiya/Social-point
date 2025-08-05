import { useParams, useNavigate, useLocation } from "react-router-dom";
import useFetchUser from "../Hooks/useFetchUser";
import defaultAvatar from "../assets/default-avatar.png";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const { username } = useParams();
  const { user, loading, error } = useFetchUser(username);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const updatedUser = location.state?.updatedUser;

  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // ✅ Decode token once and store logged-in user ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUserId(decodedToken?.id);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const isOwnProfile = loggedInUserId === user?._id;

  // ✅ Sync user data and check follow status
  useEffect(() => {
    if (updatedUser) {
      setCurrentUser(updatedUser);
    } else if (user) {
      setCurrentUser(user);
    }

    if (user && loggedInUserId && loggedInUserId !== user._id) {
      setIsFollowing(user.followers.includes(loggedInUserId));
    }
  }, [user, updatedUser, loggedInUserId]);

  if (loading || !currentUser) return <div className="text-center text-white">Loading...</div>;
  if (error || !user) return <div className="text-center text-red-500">Error: {error}</div>;

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const token = localStorage.getItem("token");
  const handleFollowToggle = async () => {
    try {
      const res = await axios.put(
        `/api/user/${user._id}/follow`,
        {}, // No body, just headers
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Info */}
      <div className="flex items-start gap-6 border-b border-gray-700 pb-6 mb-6">
        <img
          src={currentUser.avatar ? `http://localhost:5000${currentUser.avatar}` : defaultAvatar}
          alt="Avatar"
          className="w-32 h-32 rounded-full border border-gray-600 object-cover"
        />

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="text-sm text-gray-400">@{currentUser.username}</p>
            </div>

            {/* Buttons */}
            {isOwnProfile ? (
              <button
                onClick={handleEditProfile}
                className="px-4 py-1 text-sm font-semibold rounded bg-gray-800 hover:bg-gray-700 text-white"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleFollowToggle}
                  className={`px-4 py-1 text-sm font-semibold rounded ${
                    isFollowing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                  } text-white`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
                <button className="px-4 py-1 text-sm font-semibold rounded bg-green-500 hover:bg-green-600 text-white">
                  Close Friend
                </button>
                <button className="px-4 py-1 text-sm font-semibold rounded bg-gray-700 hover:bg-gray-600 text-white">
                  Message
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-300 whitespace-pre-line mt-2">
            {currentUser.bio || "No bio provided."}
          </p>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-300 mt-3">
            <span><strong>0</strong> Posts</span>
            <span><strong>{currentUser.followers.length}</strong> Followers</span>
            <span><strong>{currentUser.following.length}</strong> Following</span>
          </div>
        </div>
      </div>

      {/* Saved, Tagged (Only own profile) */}
      {isOwnProfile && (
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-1 font-semibold hover:bg-gray-700 rounded bg-gray-800 text-white text-sm">Saved</button>
          <button className="px-4 py-1 font-semibold hover:bg-gray-700 rounded bg-gray-800 text-white text-sm">Tagged</button>
        </div>
      )}

      {/* Posts */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Posts</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 text-sm text-gray-500">No posts yet.</div>
        </div>
      </div>
    </div>
  );
}
