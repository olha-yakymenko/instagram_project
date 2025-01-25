import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { user } = useAuth(); 

  useEffect(() => {
    if (!user || !user.username) {
      console.log('Użytkownik nie jest zalogowany, pomijamy połączenie z WebSocket');
      return;
    }

    const userToken = Cookies.get(`auth_token_${user.username}`);
    if (!userToken) {
      console.error('Authentication token is missing');
      return;
    }

    console.log('Connecting to WebSocket...');
    const newSocket = io('https://localhost:5007', {
      auth: { token: userToken },
      transports: ['websocket'],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('userOnline', (data) => {
      console.log('User online:', data);
      setOnlineUsers(data);
    });

    newSocket.on('userOffline', (data) => {
      console.log('User offline:', data);
      setOnlineUsers((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('Disconnected from WebSocket');
      }
    };
  }, [user]);  

  const isUserOnline = (name) => {
    return Object.values(onlineUsers).includes(name);
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
