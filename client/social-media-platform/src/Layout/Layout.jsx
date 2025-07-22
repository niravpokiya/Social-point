import { Outlet } from 'react-router-dom';
import SideNavigationPanel from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar - Fixed width, full height */}
      <div className="w-64 bg-gray-800 flex-shrink-0">
        <SideNavigationPanel />
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
        <Outlet />
      </div>
    </div>
  );
}
