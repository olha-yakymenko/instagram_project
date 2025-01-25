
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


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import './CSS/Chat.css';

const Chat = () => {
  const { roomId } = useParams();
  const [userId, setUserId] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ user1: '', user2: '', user1Id: null, user2Id: null });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const { user } = useAuth();
  const { socket, onlineUsers, isUserOnline } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom', { roomId });
      console.log(`User joined room ${roomId}`);

      socket.on('roomInfo', (info) => {
        console.log('Room info received:', info);
        if (info) {
          setRoomInfo(info);
        }
      });

      socket.on('loadMessages', (loadedMessages) => {
        console.log('Messages loaded:', loadedMessages);
        setMessages(loadedMessages);
      });

      socket.on('newMessage', (message) => {
        console.log('New message received:', message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on('userInfo', (user) => {
        console.log('User info received:', user);
        setUserId(user.id);
      });
    }

    return () => {
      if (socket) {
        socket.off('roomInfo');
        socket.off('loadMessages');
        socket.off('newMessage');
      }
    };
  }, [socket, roomId]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      console.log('Sending message:', newMessage);
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
        <div>
          <span>
            {roomInfo.user1} {isUserOnline(roomInfo.user1) ? '(Online)' : '(Offline)'}
          </span>
          <span>
            {roomInfo.user2} {isUserOnline(roomInfo.user2) ? '(Online)' : '(Offline)'}
          </span>
        </div>
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
