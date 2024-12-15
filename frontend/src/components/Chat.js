
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Chat.css';
import Cookies from 'js-cookie';

const Chat = () => {
  const { roomId } = useParams(); 
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const userToken = Cookies.get('auth_token'); 
    if (!userToken) {
      console.error('Authentication token is missing');
      return;
    }

    const newSocket = io('http://localhost:5007', {
      auth: { token: userToken },
    });

    setSocket(newSocket);

    newSocket.on('userInfo', (user) => {
        setUserId(user.id);
      });

    newSocket.emit('joinRoom', { roomId });

    newSocket.on('roomInfo', (info) => {
        if (info) {
          setRoomInfo(info);
        }
    });

    newSocket.on('loadMessages', (loadedMessages) => {
        setMessages(loadedMessages);
    });

    newSocket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      
    return () => {
        if (newSocket) newSocket.disconnect();
    };

}, [roomId]);

};

export default Chat;
