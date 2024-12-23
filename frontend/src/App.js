import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Używaj Routes
import { AuthProvider } from './components/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './components/RoomList';
import Chat from './components/Chat'
import Navbar from './components/Navbar';
import CreatePost from './components/CreatePost';
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar/>
        <Routes> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<RoomList />} /> 
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route
                path="/create-post"
                element={<CreatePost />} 
              />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
