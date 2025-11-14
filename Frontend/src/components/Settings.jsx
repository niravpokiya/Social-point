import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/axiosInstance';

export default function Settings() {
  const { theme, themes, currentTheme, changeTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'about', name: 'About', icon: 'ℹ️' }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/user/me');
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const ThemeCard = ({ themeKey, themeData, isSelected }) => (
    <div
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
      onClick={() => changeTheme(themeKey)}
      style={{
        background: `linear-gradient(135deg, ${themeData.colors.background} 0%, ${themeData.colors.surface} 100%)`,
        color: themeData.colors.text
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{themeData.name}</h3>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-sm">✓</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex space-x-2">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: themeData.colors.primary }}
          ></div>
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: themeData.colors.secondary }}
          ></div>
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: themeData.colors.accent }}
          ></div>
        </div>
        
        <div className="text-sm opacity-75">
          Preview: {themeData.name} theme
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
          Choose Your Theme
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select a theme that matches your style and mood
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(themes).map(([key, themeData]) => (
            <ThemeCard
              key={key}
              themeKey={key}
              themeData={themeData}
              isSelected={theme === key}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <h3 className="text-xl font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
          Theme Customization
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            More customization options coming soon! You'll be able to adjust colors, 
            fonts, and spacing to create your perfect social media experience.
          </p>
        </div>
      </div>
    </div>
  );

  const renderAccountTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
        Account Settings
      </h2>
      
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
              Profile Information
            </h3>
            <button 
              onClick={() => navigate('/edit-profile')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Edit Profile
            </button>
          </div>
          
          {user && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Username:</span>
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>@{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bio:</span>
                <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                  {user.bio || 'No bio added'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Account Statistics
          </h3>
          
          {user && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{user.posts?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{user.followers?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{user.following?.length || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {user.isVerified ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Verified</div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Account Actions
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full text-left px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              📝 Update Profile Information
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
        Notification Preferences
      </h2>
      
      <div className="space-y-6">
        {/* Real Notifications */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            In-App Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            These notifications are available in your app
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium" style={{ color: currentTheme.colors.text }}>New Messages</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Get notified when someone sends you a message</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium" style={{ color: currentTheme.colors.text }}>New Followers</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Get notified when someone follows you</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium" style={{ color: currentTheme.colors.text }}>Post Interactions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Get notified when someone likes or comments on your posts</div>
              </div>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Notification Management
          </h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full text-left px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              📢 View All Notifications
            </button>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Note:</strong> Push notifications are not yet implemented. These settings control in-app notifications only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
        About Social-Point
      </h2>
      
      <div className="space-y-6">
        {/* App Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">SP</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.text }}>
              Social-Point v1.0.0
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A modern social media platform for connecting with friends and sharing moments
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Current Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">User Profiles & Authentication</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Post Creation & Sharing</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Real-time Messaging</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Follow System</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Notifications</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Multi-theme Support</span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.text }}>
            Built With
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">⚛️</div>
              <div className="text-sm font-medium">React</div>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🟢</div>
              <div className="text-sm font-medium">Node.js</div>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🍃</div>
              <div className="text-sm font-medium">MongoDB</div>
            </div>
            
            <div className="text-center p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-medium">Tailwind</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Made with ❤️ by the Social-Point team</p>
          <p>© 2025 Social-Point. All rights reserved.</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'account':
        return renderAccountTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'about':
        return renderAboutTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.text }}>
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your Social-Point experience
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    color: activeTab === tab.id ? 'white' : currentTheme.colors.text
                  }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              style={{ backgroundColor: currentTheme.colors.surface }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
