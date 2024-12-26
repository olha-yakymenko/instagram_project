import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Używaj Routes
import { AuthProvider } from './components/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './components/RoomList';
import Chat from './components/Chat'
import Navbar from './components/Navbar';
import CreatePost from './components/CreatePost';
import Home from './pages/Home';
import Search from './pages/Search';
import { NotificationProvider } from './components/NotificationContext'
import { MqttProvider } from './components/MqttContext';
 
const App = () => {
  return (
    <Router>
      <AuthProvider>
      <NotificationProvider>
      <MqttProvider>
        <Navbar/>
        <Routes> 
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<RoomList />} /> 
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route
                path="/create-post"
                element={<CreatePost />} 
              />
          <Route path="/search" element={<Search />} />

        </Routes>
        </MqttProvider>
        </NotificationProvider>
        
      </AuthProvider>
    </Router>
  );
};

export default App;
