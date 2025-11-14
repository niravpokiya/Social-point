import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChatList from './components/ChatList';
import ChatPage from './components/ChatPage';
import Dashboard from './components/Dashboard';
import EditProfile from './components/edit-profile';
import Explore from './components/Explore';
import Friends from './components/Friends';
import UserListPage from './components/ListOfUser';
import Login from './components/Login';
import LoginGuard from './components/LoginGuard';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Register from './components/Register';
import Settings from './components/Settings';
import Test from './components/Test';
import Layout from './Layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<LoginGuard><Register /></LoginGuard>} />
        <Route path="/login" element={<LoginGuard><Login /></LoginGuard>} />
        <Route path="/" element={<Layout />}>
            <Route path="/home" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/profile/:id/:type" element={<UserListPage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/Messages" element={<ChatList />} />
            <Route path="/chat/:id" element={<ChatPage />} />
        </Route>
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
