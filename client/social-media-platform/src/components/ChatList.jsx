import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import axios from "../utils/axiosInstance";
import Avatar from "./Avatar";

const ChatList = ( ) => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const {currentUser, setCurrentUser} = useUser();
  // console.log(currentUser);
  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser?.id) {
        console.log("No current user or user ID:", currentUser);
        return;
      }
      
      try {
        console.log("Current user object:", currentUser);
        console.log("Fetching chats for user ID:", currentUser.id);
        console.log("User ID type:", typeof currentUser.id);
        console.log("Current user id : " + currentUser.id);
        const res = await axios.get(`/api/chat/conversations/${currentUser.id}`);
        console.log("Received conversations:", res.data);
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching chats:", err);
        console.error("Error response:", err.response?.data);
      }
    };
    fetchChats();
  }, [currentUser]);

  return (
    <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          💬 Messages
        </h2>
        <p className="text-gray-400 text-sm">Stay connected with your friends</p>
      </div>
      
      {conversations.length === 0 ? (
        <div className="text-center text-gray-400 mt-12 bg-gray-800/50 rounded-xl p-8 border border-gray-700">
          <div className="text-4xl mb-4">💭</div>
          <p className="text-lg font-medium mb-2">No conversations yet</p>
          <p className="text-sm opacity-75">Start chatting with someone to see your messages here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((chat) => (
            <div
              key={chat._id}
              onClick={() =>
                navigate(`/chat/${chat._id}`, {
                  state: { otherUser: chat.otherUser },
                })
              }
              className="flex items-center p-4 bg-gray-800/70 hover:bg-gray-700/80 rounded-xl cursor-pointer transition-all duration-200 border border-gray-700/50 hover:border-gray-600 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 ring-2 ring-gray-600 hover:ring-blue-500 transition-all">
                  <Avatar 
                    user={chat.otherUser}
                    size="w-full h-full"
                    className="rounded-full"
                  />
                </div>
                {/* Online indicator - you can add this logic later */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {chat.otherUser ? chat.otherUser.username : "Unknown User"}
                </h3>
                <p className="text-sm text-gray-400">Click to open chat</p>
              </div>
              <div className="text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
