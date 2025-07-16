import React from "react";

export default function SideNavigationPanel() {
    return(
        <aside className="w-64 bg-gray-800 text-white p-6 flex-shrink-0">
            <h1 className="text-2xl font-bold mb-6">MyApp</h1>
            <nav className="flex flex-col space-y-4">
            <Link to="/home" className="hover:text-blue-300">🏠 Home</Link>
            <Link to="/chat" className="hover:text-blue-300">💬 Chat</Link>
            <Link to="/profile" className="hover:text-blue-300">👤 Profile</Link>
            <Link to="/settings" className="hover:text-blue-300">⚙️ Settings</Link>
            <button
                className="text-left text-red-400 hover:text-red-600 mt-6"
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