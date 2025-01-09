
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import './CSS/Chat.css'
import {useAuth} from './AuthContext'
const Chat = () => {
  const { roomId } = useParams(); 
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const {user}=useAuth()

  useEffect(() => {
    const userToken = Cookies.get(`auth_token_${user.username}`); 
    if (!userToken) {
      console.error('Authentication token is missing');
      return;
    }

    const newSocket = io('https://localhost:5007', {
      auth: { token: userToken },
      transports: ['websocket'], 
      withCredentials: true,
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

const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', { roomId, content: newMessage.trim() });
      setNewMessage(''); 
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>
          Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
        </h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p>Brak wiadomości. Rozpocznij rozmowę!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id || `${message.timestamp}-${message.senderUsername}`}
              className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`} 
            >
              <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
              <p className="message-content">{message.content}</p>
              <span className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Wpisz wiadomość..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          Wyślij
        </button>
      </div>
    </div>
  );
};

export default Chat;

