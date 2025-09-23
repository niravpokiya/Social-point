import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../Hooks/useNotifications";
import api from "../utils/axiosInstance";
import SearchBar from "./SearchBar";

export default function SideNavigationPanel() {
  const location = useLocation();
  const { currentTheme } = useTheme();
  const [me, setMe] = useState(null);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/api/user/me')
      .then(res => setMe(res.data))
      .catch(() => setMe(null));
  }, []);

  const linkStyle = (path) => {
    const isActive = location.pathname.startsWith(path);
    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  };

  const navItems = [
    { path: "/home", icon: "🏠", label: "Home" },
    { path: "/explore", icon: "🔍", label: "Explore" },
    { path: "/notifications", icon: "🔔", label: "Notifications" },
    { path: "/Messages", icon:"💬", label:"Messages"},
    { path: "/friends", icon: "👥", label: "Friends" },
    { path: "/profile/me", icon: "👤", label: "Profile" },
    { path: "/settings", icon: "⚙️", label: "Settings" }
  ];

  return (
    <aside 
      className="w-64 p-6 flex-shrink-0 h-screen border-r overflow-y-auto"
      style={{ 
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border
      }}
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)`
            }}
          >
            SP
          </div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: currentTheme.colors.text }}
          >
            Social-Point
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-1.5">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={linkStyle(item.path)}
            style={{ 
              color: location.pathname.startsWith(item.path) 
                ? 'white' 
                : currentTheme.colors.text 
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.path === "/notifications" && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        ))}

        {/* Logout Button */}
        <button
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 mt-8"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
