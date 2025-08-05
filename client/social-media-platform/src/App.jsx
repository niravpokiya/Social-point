import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Test from './components/Test';
import Layout from './Layout/Layout';
import Profile from './components/Profile';
import EditProfile from './components/edit-profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
           {/* <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/inbox" element={<Inbox />}/> */}
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
           {/* <Route path="/about" element={<About /> } />
           <Route path="/settings" element={<Settings />} /> */}
        </Route>
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
