import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useMqtt } from './MqttContext'; 
import './CSS/Chat.css';
import Cookies from 'js-cookie';


const Chat = () => {
  const { roomId } = useParams();
  const [userId, setUserId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '', user1Id: null, user2Id: null });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMqttEnabled, setIsMqttEnabled] = useState(false); 
  const { user } = useAuth();
  const { mqttClient } = useMqtt(); 
  const { socket, onlineUsers, isUserOnline } = useSocket();

  useEffect(() => {
    console.log('Sprawdzam mqttClient:', mqttClient);
  
    if (isMqttEnabled && mqttClient && roomId) {
        mqttClient.subscribe(`chat/message/${roomId}`, (err, granted) => {
          if (err) {
            console.error('Błąd subskrypcji na temat chat/message:', err);
          } else {
            console.log('Subskrybowano temat chat/message:', granted);
          }
        });

      mqttClient.on('subscribe', (topic, granted) => {
        console.log('Subskrypcja na temat:', topic, 'Zatwierdzone:', granted);
      });
  
      mqttClient.on('error', (error) => {
        console.error('Błąd połączenia z brokerem MQTT:', error);
      });
  
      mqttClient.on('close', () => {
        console.log('Połączenie z brokerem MQTT zostało zamknięte.');
      });
    
  
      mqttClient.on('message', (topic, message) => {
        const parsedMessage = JSON.parse(message.toString());
        console.log("dostalem", parsedMessage, topic)

    });
    
  
      return () => {
        mqttClient.unsubscribe(`chat/message/${roomId}`);
      };
    } else if (socket) {
      socket.emit('joinRoom', { roomId });
  
      socket.on('roomInfo', (info) => {
        setRoomInfo(info);
      });
  
      socket.on('loadMessages', (loadedMessages) => {
        setMessages(loadedMessages);
      });
  
      socket.on('newMessage', (message) => {
        setMessages((prevMessages) => {
          return [...prevMessages, message];
        });
      });
  
      socket.on('userInfo', (user) => {
        setUserId(user.id);
      });
  
      return () => {
        socket.off('roomInfo');
        socket.off('loadMessages');
        socket.off('newMessage');
      };
    }
  }, [roomId, isMqttEnabled, mqttClient, socket]);
  

  const handleSendMessage = () => {
    const token = Cookies.get(`auth_token_${user.username}`);
    if (newMessage.trim()) {
      const message = {
        roomId,
        content: newMessage.trim(),
        senderId: userId,
        senderUsername: user.username,
        token: token,
      };
      if (isMqttEnabled && mqttClient) {
        console.log("MM", message)
        mqttClient.publish(`chat/message/${roomId}`, JSON.stringify(message));
      } else if (socket) {
        socket.emit('sendMessage', message);
      }
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>
          Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
        </h2>
        <div>
          <span>
            {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
          </span>
          <span>
            {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
          </span>
        </div>
        <div>
          <button onClick={() => setIsMqttEnabled(!isMqttEnabled)}>
            {isMqttEnabled ? 'Użyj WebSocket' : 'Użyj MQTT'}
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p>Brak wiadomości. Rozpocznij rozmowę!</p>
        ) : (
          
          messages.map((message) => {
            console.log(message)
            return (
              <div
              key={message.id || `${message.timestamp}-${message.senderUsername}` || `${message.content} - ${message.senderUsername}`}
              className={`message ${message.senderUsername === user.username ? 'outgoing' : 'incoming'}`}
            >
              <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
              <p className="message-content">{message.content}</p>
              <span className="message-timestamp">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </span>
            </div>
            
          )})
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
