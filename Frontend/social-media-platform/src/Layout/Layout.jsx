import { Outlet } from 'react-router-dom';
import AuthGuard from "../components/AuthGuard";
import SideNavigationPanel from "../components/Sidebar";
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { currentTheme } = useTheme();

  return (
    <AuthGuard>
      <div 
        className="flex h-screen overflow-hidden transition-colors duration-300"
        style={{ 
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.text
        }}
      >
        {/* Sidebar - Fixed width, full height */}
        <SideNavigationPanel />

        {/* Main content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <Outlet />
        </div>
      </div>
    </AuthGuard>
  );
}
