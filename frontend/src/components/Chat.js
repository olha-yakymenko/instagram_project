
// // import React, { useState, useEffect } from 'react';
// // import { useParams } from 'react-router-dom';
// // import { io } from 'socket.io-client';
// // import Cookies from 'js-cookie';
// // import './CSS/Chat.css'
// // import {useAuth} from './AuthContext'
// // const Chat = () => {
// //   const { roomId } = useParams(); 
// //   const [socket, setSocket] = useState(null);
// //   const [userId, setUserId] = useState(null);
// //   const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '' });
// //   const [messages, setMessages] = useState([]);
// //   const [newMessage, setNewMessage] = useState('');
// //   const {user}=useAuth()

// //   useEffect(() => {
// //     const userToken = Cookies.get(`auth_token_${user.username}`); 
// //     if (!userToken) {
// //       console.error('Authentication token is missing');
// //       return;
// //     }

// //     const newSocket = io('https://localhost:5007', {
// //       auth: { token: userToken },
// //       transports: ['websocket'], 
// //       withCredentials: true,
// //     });

// //     setSocket(newSocket);

// //     newSocket.on('userInfo', (user) => {
// //         setUserId(user.id);
// //       });

// //     newSocket.emit('joinRoom', { roomId });

// //     newSocket.on('roomInfo', (info) => {
// //         if (info) {
// //           setRoomInfo(info);
// //         }
// //     });

// //     newSocket.on('loadMessages', (loadedMessages) => {
// //         setMessages(loadedMessages);
// //     });

// //     newSocket.on('newMessage', (message) => {
// //         setMessages((prevMessages) => [...prevMessages, message]);
// //       });
      
// //     return () => {
// //         if (newSocket) newSocket.disconnect();
// //     };

// // }, [roomId]);

// // const handleSendMessage = () => {
// //     if (newMessage.trim() && socket) {
// //       socket.emit('sendMessage', { roomId, content: newMessage.trim() });
// //       setNewMessage(''); 
// //     }
// //   };

// //   return (
// //     <div className="chat-container">
// //       <div className="chat-header">
// //         <h2>
// //           Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
// //         </h2>
// //       </div>

// //       <div className="chat-messages">
// //         {messages.length === 0 ? (
// //           <p>Brak wiadomości. Rozpocznij rozmowę!</p>
// //         ) : (
// //           messages.map((message) => (
// //             <div
// //               key={message.id || `${message.timestamp}-${message.senderUsername}`}
// //               className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`} 
// //             >
// //               <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
// //               <p className="message-content">{message.content}</p>
// //               <span className="message-timestamp">
// //                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //               </span>
// //             </div>
// //           ))
// //         )}
// //       </div>

// //       <div className="chat-input">
// //         <input
// //           type="text"
// //           placeholder="Wpisz wiadomość..."
// //           value={newMessage}
// //           onChange={(e) => setNewMessage(e.target.value)}
// //           onKeyDown={(e) => {
// //             if (e.key === 'Enter') handleSendMessage();
// //           }}
// //         />
// //         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
// //           Wyślij
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Chat;





// import React, { useState, useEffect, useContext } from 'react';
// import { useParams } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import Cookies from 'js-cookie';
// import './CSS/Chat.css';
// import { useAuth } from './AuthContext';
// import { useOnlineUsers } from './ChatContext';

// const Chat = () => {
//   const { roomId } = useParams(); 
//   const [socket, setSocket] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '', user1Id: null, user2Id: null });
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [onlineUsers, setOnlineUsers] = useState({});
//   const { user } = useAuth();
//   const { setUsers } = useOnlineUsers()

//   useEffect(() => {
//     const userToken = Cookies.get(`auth_token_${user.username}`); 
//     if (!userToken) {
//       console.error('Authentication token is missing');
//       return;
//     }

//     console.log('Connecting to WebSocket...');
//     const newSocket = io('https://localhost:5007', {
//       auth: { token: userToken },
//       transports: ['websocket'], 
//       withCredentials: true,
//     });

//     setSocket(newSocket);

//     newSocket.on('userInfo', (user) => {
//       console.log('User info received:', user);
//       setUserId(user.id);
//     });

//     newSocket.emit('joinRoom', { roomId });
//     console.log(`User joined room ${roomId}`);

//     newSocket.on('roomInfo', (info) => {
//       console.log('Room info received:', info);
//       if (info) {
//         setRoomInfo(info);
//       }
//     });

//     newSocket.on('loadMessages', (loadedMessages) => {
//       console.log('Messages loaded:', loadedMessages);
//       setMessages(loadedMessages);
//     });

//     newSocket.on('newMessage', (message) => {
//       console.log('New message received:', message);
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });

//     // Nasłuchujemy na zdarzenia online i offline
//     newSocket.on('userOnline', (data) => {
//       console.log('User online:', data);
//       //setOnlineUsers((prev) => ({ ...prev, [data.username]: true }));
//       //setOnlineUsers(Object.values(data))
//       setOnlineUsers(data)
//       setUsers(data)
//     });

//     newSocket.on('userOffline', (data) => {
//       console.log('User offline:', data);
//       setOnlineUsers((prev) => {
//         const updated = { ...prev };
//         delete updated[data.userId];
//         return updated;
//       });
//     });

//     return () => {
//       if (newSocket) {
//         newSocket.disconnect();
//         console.log('Disconnected from WebSocket');
//       }
//     };

//   }, [roomId, user.username]);

//   const handleSendMessage = () => {
//     if (newMessage.trim() && socket) {
//       console.log('Sending message:', newMessage);
//       socket.emit('sendMessage', { roomId, content: newMessage.trim() });
//       setNewMessage('');
//     }
//   };

//   const isUserOnline = (name) => {
//     console.log("iii", onlineUsers)
//     console.log(name)
//     console.log(onlineUsers)
//     return Object.values(onlineUsers).includes(name);
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>
//           Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
//         </h2>
//         <div>
//           {/* {roomInfo.user1Id && ( */}
//             <span>
//               {console.log(roomInfo)}
//               {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
//             </span>
//           {/* ) */}
//           {/* } */}
//           {/* {roomInfo.user2Id && ( */}
//             <span>
//               {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
//             </span>
//           {/* )} */}
//         </div>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <p>Brak wiadomości. Rozpocznij rozmowę!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id || `${message.timestamp}-${message.senderUsername}`}
//               className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`} 
//             >
//               <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
//               <p className="message-content">{message.content}</p>
//               <span className="message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Wpisz wiadomość..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') handleSendMessage();
//           }}
//         />
//         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
//           Wyślij
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;




//dziala ale bez mqtt
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSocket } from './SocketContext';
// import { useAuth } from './AuthContext';
// import './CSS/Chat.css';

// const Chat = () => {
//   const { roomId } = useParams();
//   const [userId, setUserId] = useState(null);
//   const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '', user1Id: null, user2Id: null });
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
  
//   const { user } = useAuth();
//   const { socket, onlineUsers, isUserOnline } = useSocket();

//   useEffect(() => {
//     if (socket) {
//       socket.emit('joinRoom', { roomId });
//       console.log(`User joined room ${roomId}`);

//       socket.on('roomInfo', (info) => {
//         console.log('Room info received:', info);
//         if (info) {
//           setRoomInfo(info);
//         }
//       });

//       socket.on('loadMessages', (loadedMessages) => {
//         console.log('Messages loaded:', loadedMessages);
//         setMessages(loadedMessages);
//       });

//       socket.on('newMessage', (message) => {
//         console.log('New message received:', message);
//         setMessages((prevMessages) => [...prevMessages, message]);
//       });

//       socket.on('userInfo', (user) => {
//         console.log('User info received:', user);
//         setUserId(user.id);
//       });
//     }

//     return () => {
//       if (socket) {
//         socket.off('roomInfo');
//         socket.off('loadMessages');
//         socket.off('newMessage');
//       }
//     };
//   }, [socket, roomId]);

//   const handleSendMessage = () => {
//     if (newMessage.trim() && socket) {
//       console.log('Sending message:', newMessage);
//       socket.emit('sendMessage', { roomId, content: newMessage.trim() });
//       setNewMessage('');
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>
//           Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
//         </h2>
//         <div>
//           <span>
//             {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
//           </span>
//           <span>
//             {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
//           </span>
//         </div>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <p>Brak wiadomości. Rozpocznij rozmowę!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id || `${message.timestamp}-${message.senderUsername}`}
//               className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`}
//             >
//               <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
//               <p className="message-content">{message.content}</p>
//               <span className="message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Wpisz wiadomość..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') handleSendMessage();
//           }}
//         />
//         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
//           Wyślij
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;


// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSocket } from './SocketContext';
// import { useAuth } from './AuthContext';
// import { useMqtt } from './MqttContext'; // importuj hooka z kontekstu MQTT
// import './CSS/Chat.css';

// const Chat = () => {
//   const { roomId } = useParams();
//   const [userId, setUserId] = useState(null);
//   const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '', user1Id: null, user2Id: null });
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isMqttEnabled, setIsMqttEnabled] = useState(false); // Przełącznik między WebSocket i MQTT
  
//   const { user } = useAuth();
//   const { socket, onlineUsers, isUserOnline } = useSocket();
//   const { mqttClient } = useMqtt(); // Dostęp do klienta MQTT z kontekstu
  
//   useEffect(() => {
//     if (isMqttEnabled && mqttClient) {
//       // Jeśli wybrano MQTT
//       mqttClient.subscribe(`chat/${roomId}`);
//       console.log('Subscribed to chat:', `chat/${roomId}`);

//       mqttClient.on('message', (topic, message) => {
//         const messageData = JSON.parse(message.toString());
//         setMessages((prevMessages) => [...prevMessages, messageData]);
//       });

//       return () => {
//         mqttClient.unsubscribe(`chat/${roomId}`);
//         console.log('Unsubscribed from chat:', `chat/${roomId}`);
//       };
//     } else if (socket) {
//       // Jeśli wybrano WebSocket
//       socket.emit('joinRoom', { roomId });
//       console.log(`User joined room ${roomId}`);
  
//       socket.on('roomInfo', (info) => {
//         console.log('Room info received:', info);
//         if (info) {
//           setRoomInfo(info);
//         }
//       });
  
//       socket.on('loadMessages', (loadedMessages) => {
//         console.log('Messages loaded:', loadedMessages);
//         setMessages(loadedMessages);
//       });
  
//       socket.on('newMessage', (message) => {
//         console.log('New message received:', message);
//         setMessages((prevMessages) => [...prevMessages, message]);
//       });
  
//       socket.on('userInfo', (user) => {
//         console.log('User info received:', user);
//         setUserId(user.id);
//       });

//       return () => {
//         socket.off('roomInfo');
//         socket.off('loadMessages');
//         socket.off('newMessage');
//       };
//     }
//   }, [roomId, isMqttEnabled, mqttClient, socket]); // Re-run effect when switching between WebSocket and MQTT
  
//   const handleSendMessage = () => {
//     if (newMessage.trim()) {
//       const messageData = {
//         roomId,
//         content: newMessage.trim(),
//         senderUsername: user.username,
//         senderId: user.id,
//         timestamp: new Date().toISOString(),
//       };

//       if (isMqttEnabled && mqttClient) {
//         // Jeśli wybrano MQTT
//         mqttClient.publish(`chat/${roomId}`, JSON.stringify(messageData));
//         console.log('Message sent via MQTT:', messageData);
//       } else if (socket) {
//         // Jeśli wybrano WebSocket
//         socket.emit('sendMessage', messageData);
//         console.log('Message sent via WebSocket:', messageData);
//       }
//       setNewMessage('');
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>
//           Rozmowa z {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
//         </h2>
//         <div>
//           <span>
//             {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
//           </span>
//           <span>
//             {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
//           </span>
//         </div>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <p>Brak wiadomości. Rozpocznij rozmowę!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id || `${message.timestamp}-${message.senderUsername}`}
//               className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`}
//             >
//               <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
//               <p className="message-content">{message.content}</p>
//               <span className="message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Wpisz wiadomość..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') handleSendMessage();
//           }}
//         />
//         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
//           Wyślij
//         </button>
//       </div>

//       <div className="chat-switch">
//         <button onClick={() => setIsMqttEnabled(false)} className={isMqttEnabled ? 'disabled' : ''}>
//           Użyj WebSocket
//         </button>
//         <button onClick={() => setIsMqttEnabled(true)} className={isMqttEnabled ? 'active' : ''}>
//           Użyj MQTT
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;




// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSocket } from './SocketContext';
// import { useAuth } from './AuthContext';
// import { useMqtt } from './MqttContext';
// import './CSS/Chat.css';
// import Cookies from 'js-cookie';

// const Chat = () => {
//   const { roomId } = useParams(); // Pobranie ID pokoju z URL
//   const [userId, setUserId] = useState(null);
//   const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '' });
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isMqttEnabled, setIsMqttEnabled] = useState(false);

//   const { user } = useAuth(); // Użytkownik z contextu autoryzacji
//   const { socket, isUserOnline } = useSocket(); // WebSocket
//   const { mqttClient } = useMqtt(); // MQTT Client

//   // ✅ Pobieranie wiadomości i subskrypcja MQTT lub WebSocket
//   useEffect(() => {
//     if (!roomId) return;

//     // Subskrypcja na wiadomości w zależności od wybranego protokołu
//     if (isMqttEnabled && mqttClient) {
//       const topic = `chat/message/${roomId}`;
//       mqttClient.subscribe(topic);
//       console.log(`📡 Subscribed to MQTT topic: ${topic}`);

//       const onMqttMessage = (topic, message) => {
//         try {
//           const messageData = JSON.parse(message.toString());
//           console.log(`📩 Received MQTT message:`, messageData);
//           setMessages((prev) => [...prev, messageData]);
//         } catch (error) {
//           console.error('❌ Error parsing MQTT message:', error);
//         }
//       };

//       mqttClient.on('message', onMqttMessage);

//       return () => {
//         mqttClient.unsubscribe(topic);
//         mqttClient.removeListener('message', onMqttMessage);
//         console.log(`🚫 Unsubscribed from MQTT topic: ${topic}`);
//       };
//     } else if (socket) {
//       // WebSocket logika
//       socket.emit('joinRoom', { roomId });
//       console.log(`🔗 Joined WebSocket room: ${roomId}`);

//       const onRoomInfo = (info) => setRoomInfo(info);
//       const onLoadMessages = (loadedMessages) => setMessages(loadedMessages);
//       const onNewMessage = (message) => setMessages((prev) => [...prev, message]);
//       const onUserInfo = (user) => setUserId(user.id);

//       socket.on('roomInfo', onRoomInfo);
//       socket.on('loadMessages', onLoadMessages);
//       socket.on('newMessage', onNewMessage);
//       socket.on('userInfo', onUserInfo);

//       return () => {
//         socket.off('roomInfo', onRoomInfo);
//         socket.off('loadMessages', onLoadMessages);
//         socket.off('newMessage', onNewMessage);
//         socket.off('userInfo', onUserInfo);
//         console.log(`🔌 Disconnected from WebSocket room: ${roomId}`);
//       };
//     }
//   }, [roomId, isMqttEnabled, mqttClient, socket]);

//   // ✅ Wysyłanie wiadomości
//   const handleSendMessage = () => {
//     if (!newMessage.trim()) return; // Jeśli wiadomość jest pusta, nic nie wysyłaj

//     // Pobranie tokena z cookies
//     const token = Cookies.get(`auth_token_${user.username}`);
//     if (!token) {
//       console.error('❌ Token not found');
//       return;
//     }

//     // Dane wiadomości
//     const messageData = {
//       roomId,
//       content: newMessage.trim(),
//       senderUsername: user.username,
//       senderId: user.id,
//       timestamp: new Date().toISOString(),
//       token: token, // Dodanie tokena do wiadomości
//     };

//     console.log("📤 Sending message:", messageData);

//     // Wysyłanie wiadomości przez MQTT lub WebSocket
//     if (isMqttEnabled && mqttClient) {
//       const topic = `chat/message/${roomId}`;
//       mqttClient.publish(topic, JSON.stringify(messageData)); // Publikowanie wiadomości
//       console.log(`📤 Sent message via MQTT to ${topic}:`, messageData);
//     } else if (socket) {
//       socket.emit('sendMessage', messageData); // Wysyłanie przez WebSocket
//       console.log(`📤 Sent message via WebSocket:`, messageData);
//     }

//     setNewMessage(''); // Czyścimy pole tekstowe po wysłaniu wiadomości
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <h2>
//           Rozmowa: {roomInfo.user1 || 'Nieznany użytkownik'} i {roomInfo.user2 || 'Nieznany użytkownik'}
//         </h2>
//         <div>
//           <span>
//             {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
//           </span>
//           <span>
//             {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
//           </span>
//         </div>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 ? (
//           <p>Brak wiadomości. Rozpocznij rozmowę!</p>
//         ) : (
//           messages.map((message) => (
//             <div
//               key={message.id || `${message.timestamp}-${message.senderUsername}`}
//               className={`message ${message.senderId === userId ? 'outgoing' : 'incoming'}`}
//             >
//               <span className="message-user">{message.senderUsername || 'Nieznany użytkownik'}</span>
//               <p className="message-content">{message.content}</p>
//               <span className="message-timestamp">
//                 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </span>
//             </div>
//           ))
//         )}
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Wpisz wiadomość..."
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)} // Ustawianie treści wiadomości
//           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Wysłanie po naciśnięciu Enter
//         />
//         <button onClick={handleSendMessage} disabled={!newMessage.trim()}>
//           Wyślij
//         </button>
//       </div>

//       <div className="chat-switch">
//         <button onClick={() => setIsMqttEnabled(false)} className={!isMqttEnabled ? 'active' : ''}>
//           Użyj WebSocket
//         </button>
//         <button onClick={() => setIsMqttEnabled(true)} className={isMqttEnabled ? 'active' : ''}>
//           Użyj MQTT
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;




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
        
        mqttClient.subscribe(`chat/join/${roomId}`, (err, granted) => {
          if (err) {
            console.error('Błąd subskrypcji na temat chat/join:', err);
          } else {
            console.log('Subskrybowano temat chat/join:', granted);
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
    
        if (topic.includes('message')) {
            setMessages((prevMessages) => {
                console.log("ZAP1");
    
                const messageExists = prevMessages.some(msg => 
                    msg.id === parsedMessage.id || 
                    (msg.content === parsedMessage.content && msg.senderUsername === parsedMessage.senderUsername)
                );
    
                if (!messageExists) {
                    return [...prevMessages, parsedMessage];
                } else {
                    console.log("Duplikat wiadomości - nie dodaję ponownie");
                    return prevMessages;
                }
            });
        }
    });
    
  
      return () => {
        mqttClient.unsubscribe(`chat/message/${roomId}`);
        mqttClient.unsubscribe(`chat/join/${roomId}`);
      };
    } else if (socket) {
      socket.emit('joinRoom', { roomId });
  
      socket.on('roomInfo', (info) => {
        setRoomInfo(info);
      });
  
      socket.on('loadMessages', (loadedMessages) => {
        setMessages(loadedMessages);
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
