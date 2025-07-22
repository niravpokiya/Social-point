import { useParams } from "react-router-dom";
import useFetchUser from "../Hooks/useFetchUser";
import defaultAvatar from "../assets/default-avatar.png";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const { username } = useParams(); // ⬅️ get username from route
  const { user, loading, error } = useFetchUser(username); // ⬅️ pass to hook
  // console.log("Username param:", username);
  let loggedInUserId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      loggedInUserId = decodedToken?.id;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const isOwnProfile = loggedInUserId === user?._id;

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error || !user) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="px-6 py-4">
      {/* Profile Info */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={defaultAvatar}
          alt="Avatar"
          className="w-28 h-28 rounded-full border border-gray-700"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-400">@{user.username}</p>
          <p className="text-sm text-gray-400 mt-1">{user.bio || "No bio provided."}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-300">
            <span><strong>0</strong> Posts</span>
            <span><strong>0</strong> Followers</span>
            <span><strong>0</strong> Following</span>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className="flex gap-4 mb-4">
          <button className="px-5 py-1 font-bold hover:bg-gray-700 rounded bg-gray-800 text-white text-sm cursor-pointer">Edit Profile</button>
          <button className="px-5 py-1 font-bold hover:bg-gray-700 rounded bg-gray-800 text-white text-sm cursor-pointer">Saved</button>
          <button className="px-5 py-1 font-bold hover:bg-gray-700 rounded bg-gray-800 text-white text-sm cursor-pointer">Tagged</button>
        </div>
      )}

      {/* Posts Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Posts</h3>
        <div className="grid grid-cols-3 gap-2">
          <p className="col-span-3 text-sm text-gray-500">No posts yet.</p>
        </div>
      </div>
    </div>
  );
}
