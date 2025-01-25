import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import CreatePost from './components/CreatePost';
import Search from './pages/Search';
import { NotificationProvider } from './components/NotificationContext'
import Notifications from './components/Notification';
import Chat from './components/Chat';  
import RoomList from './components/RoomList'; 
import { MqttProvider } from './components/MqttContext';
import NotificationList from './components/NotificationList';
import { SocketProvider } from './components/SocketContext';
const App = () => {
  return (
    <Router>
      <AuthProvider>
      <NotificationProvider>
        <MqttProvider>
          <NotificationList/>
            <Navbar />
            <SocketProvider>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile/:userId"
                element={<Profile />} 
              />
              <Route
                path="/create-post"
                element={<CreatePost />} 
              />
              <Route
                path="/notifications"
                element={<Notifications />}
              />
              <Route path="/chat" element={<RoomList />} /> {/* Lista pokoi */}

              <Route path="/chat/:roomId" element={<Chat />} /> {/* Pokój czatu */}
              
              <Route path="/search" element={<Search />} />
            </Routes>
          </SocketProvider>
        </MqttProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
