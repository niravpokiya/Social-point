import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function SideNavigationPanel() {
  const location = useLocation();

  const linkStyle = (path) =>
    `hover:text-blue-300 ${
      location.pathname.startsWith(path) ? "text-blue-400 font-semibold" : ""
    }`;

  return (
    <aside className="w-64 bg-[#111827] text-white p-6 flex-shrink-0 h-screen">
      <h1 className="text-2xl font-bold mb-8">Social-point</h1>
      <nav className="flex flex-col space-y-5 text-md">
        <Link to="/home" className={linkStyle("/home")}>🏠 Home</Link>
        <Link to="/explore" className={linkStyle("/explore")}>🔍 Explore</Link>
        <Link to="/notifications" className={linkStyle("/notifications")}>🔔 Notifications</Link>
        <Link to="/chat" className={linkStyle("/chat")}>💬 Messages</Link>
        <Link to="/friends" className={linkStyle("/friends")}>👥 Friends</Link>
        <Link to="/reels" className={linkStyle("/reels")}>📷 Reels</Link>
        <Link to="/profile/me" className={linkStyle("/profile")}>👤 Profile</Link>
        <Link to="/settings" className={linkStyle("/settings")}>⚙️ Settings</Link>

        <button
          className="text-left text-red-400 hover:text-red-600 mt-8"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = "/login";
          }}
        >
          🚪 Logout
        </button>
      </nav>
    </aside>
  );
}
