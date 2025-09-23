import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useUser } from "../context/userContext";
import axios from "../utils/axiosInstance";
import Avatar from "./Avatar";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const { id: conversationId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useUser();

  // Fetch messages
  const [otherUser, setOtherUser] = useState(state?.otherUser || null);

  // Helper function to format date for display
  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    // Reset time to midnight for accurate day comparison
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const messageMidnight = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Calculate difference in days
    const diffTime = todayMidnight - messageMidnight;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 6) return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    return messageDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to check if messages are on different days
  const isDifferentDay = (current, previous) => {
    if (!previous) return true;
    const currentDate = new Date(current.createdAt).toDateString();
    const previousDate = new Date(previous.createdAt).toDateString();
    return currentDate !== previousDate;
  };

  // Helper function to format time for hover
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!conversationId || otherUser || !currentUser) return;

      try {
        const res = await axios.get(`/api/chat/conversation/${conversationId}`);
        // conversation.members = [currentUser._id, otherUserId]
        const otherId = res.data.members.find(id => id !== currentUser.id);
        const userRes = await axios.get(`/api/user/id/${otherId}`);
        setOtherUser(userRes.data);
      } catch (err) {
        console.error("Error fetching other user:", err);
      }
    };

    fetchOtherUser();
  }, [conversationId, currentUser?.id, otherUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      
      try {
        const res = await axios.get(`/api/chat/messages/${conversationId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [conversationId]);

  // Socket connection
  useEffect(() => {
    if (!currentUser) return;

    socket.emit("addUser", currentUser.id);

    socket.on("getMessage", (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("getMessage");
  }, [conversationId, currentUser?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !currentUser) return;
  
    let convId = conversationId;
    const targetUser = otherUser || state?.otherUser;
    
    if (!targetUser) {
      console.error("No target user found");
      return;
    }
    
    // Create conversation if it doesn't exist
    if (!convId) {
      try {
        const res = await axios.post("/api/chat/conversation", {
          senderId: currentUser.id,
          receiverId: targetUser._id || targetUser.id,
        });
        convId = res.data._id;
      } catch (err) {
        console.error("Error creating conversation:", err);
        return;
      }
    }
  
    const msg = {
      conversationId: convId,
      sender: currentUser.id,
      text,
    };
  
    try {
      const savedMessage = await axios.post("/api/chat/message", msg);
      
      // Emit socket message with correct structure
      socket.emit("sendMessage", {
        senderId: currentUser.id,
        receiverId: targetUser._id || targetUser.id,
        text,
        conversationId: convId,
      });
  
      setMessages((prev) => [
        ...prev,
        { ...savedMessage.data, createdAt: savedMessage.data.createdAt || new Date().toISOString() },
      ]);
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
   
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    const targetUser = otherUser || state?.otherUser;
    if (targetUser?.username) {
      navigate(`/profile/${targetUser.username}`);
    }
  };

  // Typing indicator
  const handleInputChange = (e) => {
    setText(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div 
            className="relative cursor-pointer group"
            onClick={handleProfileClick}
          >
            <Avatar
              user={otherUser}
              size="w-12 h-12"
              className="border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div 
            className="flex-1 cursor-pointer hover:bg-white/10 rounded-lg p-2 -m-2 transition-colors duration-200"
            onClick={handleProfileClick}
          >
            <h2 className="text-lg font-semibold text-white">
              {otherUser?.username || state?.otherUser?.username || "User"}
            </h2>
            <p className="text-sm text-blue-100 opacity-80">
              {isTyping ? "typing..." : "Click to view profile"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23374151' fill-opacity='0.05'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      >
        {messages.map((m, idx) => (
          <React.Fragment key={idx}>
            {/* Date Separator */}
            {isDifferentDay(m, messages[idx - 1]) && (
              <div className="flex justify-center my-4">
                <div className="bg-gray-700/80 backdrop-blur-sm text-gray-300 text-xs px-3 py-1 rounded-full shadow-lg">
                  {formatDate(m.createdAt)}
                </div>
              </div>
            )}
            
            {/* Message */}
            <div
              className={`flex group ${
                m.sender === currentUser.id ? "justify-end" : "justify-start"
              } mb-1`}
            >
              <div className="relative max-w-xs lg:max-w-md">
                {/* Timestamp on hover - left side for received, right side for sent */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                  m.sender === currentUser.id 
                    ? "-left-20 text-right" 
                    : "-right-20 text-left"
                }`}>
                  <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {formatTime(m.createdAt)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative px-4 py-2 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] ${
                    m.sender === currentUser.id
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                  }`}
                >
                  {/* Message tail */}
                  <div
                    className={`absolute bottom-0 w-3 h-3 ${
                      m.sender === currentUser.id
                        ? "right-0 bg-blue-600 transform rotate-45 translate-x-1 translate-y-1"
                        : "left-0 bg-white border-l border-b border-gray-200 transform rotate-45 -translate-x-1 translate-y-1"
                    }`}
                  ></div>
                  
                  <p className="relative z-10 leading-relaxed">{m.text}</p>
                  
                  {/* Time and status at bottom right of bubble */}
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    m.sender === currentUser.id ? "text-blue-100" : "text-gray-500"
                  }`}>
                    <span className="text-xs">
                      {new Date(m.createdAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {m.sender === currentUser.id && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <textarea
              rows={1}
              className="w-full px-4 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none min-h-[48px] max-h-32"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              style={{ lineHeight: '1.5' }}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              text.trim()
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
