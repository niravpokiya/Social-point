import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosInstance";
import Avatar from "./Avatar";

export default function UserListPage() {
  const { id, type } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching data for:", { id, type });
        
        // Fetch both the user list and profile info
        const [usersRes, profileRes] = await Promise.all([
          api.get(`/api/user/${id}/${type}`),
          api.get(`/api/user/id/${id}`)
        ]);
        
        console.log("Users response:", usersRes.data);
        console.log("Profile response:", profileRes.data);
        
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setUserProfile(profileRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error response:", err.response?.data);
        
        // Handle privacy restriction (403 error)
        if (err.response?.status === 403) {
          setUsers('restricted');
        } else {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading {type}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <Avatar user={userProfile} size="w-12 h-12" />
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 dark:text-white">{userProfile?.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{userProfile?.username}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 capitalize">
              {type}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {users.length} {type === 'followers' ? 'people following' : 'people followed by'} {userProfile?.name}
            </p>
          </div>
        </div>

        {/* Users List */}
        {users === 'restricted' ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Private {type}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You can only view {type} of users who follow you back.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Follow each other to see {type} lists!
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No {type} yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {type === 'followers' 
                ? "This user doesn't have any followers yet." 
                : "This user isn't following anyone yet."
              }
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  All {type}
                </h2>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {users.length} {type === 'followers' ? 'followers' : 'following'}
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((person, index) => (
                <div
                  key={person._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar user={person} size="w-14 h-14" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                            {person.name}
                          </h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">@{person.username}</p>
                        {person.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Link
                        to={`/profile/${person.username}`}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
