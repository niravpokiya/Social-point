import { Outlet } from 'react-router-dom';
import SideNavigationPanel from "../components/Sidebar";
export default function Layout() {
    return (
        <>
            <div className="container flex">
                <div className="NavigationPanel">
                  <SideNavigationPanel />
                </div>
                <div className="MainComponent">
                  <Outlet />
                </div>
            </div>
        </>
    )
}