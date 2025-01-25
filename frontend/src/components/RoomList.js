// import React, { useState, useEffect } from 'react';  
// import { useNavigate } from 'react-router-dom';      
// import api from '../services/api';                          
// import { Link } from 'react-router-dom';            
// import './CSS/RoomList.css'
// import { useSocket } from './SocketContext';


// const RoomList = () => {
//   const [rooms, setRooms] = useState([]);           
//   const [searchTerm, setSearchTerm] = useState('');  
//   const [searchResults, setSearchResults] = useState([]); 
//   const [loading, setLoading] = useState(false);     
//   const navigate = useNavigate();  
//   const { onlineUsers } = useSocket()
//   console.log(onlineUsers)

//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         const response = await api.get('/message/rooms', { withCredentials: true });
//         setRooms(response.data)
//         console.log(response.data); 
//       } catch (error) {
//         console.error('Error fetching rooms', error);
//       }
//     };

//     fetchRooms();  
//   }, []);

//   const searchUsers = async () => {
//     if (!searchTerm.trim()) return;

//     setLoading(true);  
//     try {
//       const response = await api.get(`/message/search-user/${searchTerm}`, { withCredentials: true });
//       setSearchResults(response.data);
//       console.log("wysz", response.data)
//     } catch (error) {
//       console.error('Error searching users', error);
//     } finally {
//       setLoading(false);  
//     }
//   };

//   const startChat = async (recipientId) => {
//     try {
//       const response = await api.post('/message/start-chat', { recipientId }, { withCredentials: true });
//       const { roomId } = response.data;
//       navigate(`/chat/${roomId}`);
//     } catch (error) {
//       console.error('Error starting chat', error);
//     }
//   };

//   return (
//     <div className="room-list-container">
//       <h2>Lista czatów</h2>
      
//       <div className="search-bar">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}  
//           placeholder="Wyszukaj użytkownika"
//         />
//         <button onClick={searchUsers} disabled={loading}>
//           {loading ? 'Ładowanie...' : <i className="fas fa-search"></i>}
//         </button>
//       </div>

//       <div className="search-results">
//         {searchResults.length > 0 ? (
//           <ul>
//             {searchResults.map((user) => (
//               <li key={user.id}>
//                 <span>{user.username}</span>
//                 <button onClick={() => startChat(user.id)}>Rozpocznij czat</button>
//               </li>
//             ))}
//           </ul>
//         ) : searchTerm ? (
//           <p>Brak użytkowników pasujących do tego zapytania.</p>
//         ) : null}
//       </div>

//       <h3>Twoje czaty</h3>
//       <div className="room-list">
//         <ul>
//           {rooms.map((room) => (
//             <li key={room.id}>
//               <Link to={`/chat/${room.id}`}>
//                 {room.user2}
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default RoomList;




// import React, { useState, useEffect } from 'react';  
// import { useNavigate } from 'react-router-dom';      
// import api from '../services/api';                          
// import { Link } from 'react-router-dom';            
// import './CSS/RoomList.css'
// import { useSocket } from './SocketContext';

// const RoomList = () => {
//   const [rooms, setRooms] = useState([]);           
//   const [searchTerm, setSearchTerm] = useState('');  
//   const [searchResults, setSearchResults] = useState([]); 
//   const [loading, setLoading] = useState(false);     
//   const navigate = useNavigate();  
//   const { onlineUsers, isUserOnline } = useSocket();  // Pobieramy onlineUsers i isUserOnline

//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         const response = await api.get('/message/rooms', { withCredentials: true });
//         setRooms(response.data);
//         console.log(response.data); 
//       } catch (error) {
//         console.error('Error fetching rooms', error);
//       }
//     };

//     fetchRooms();  
//   }, []);

//   const searchUsers = async () => {
//     if (!searchTerm.trim()) return;

//     setLoading(true);  
//     try {
//       const response = await api.get(`/message/search-user/${searchTerm}`, { withCredentials: true });
//       setSearchResults(response.data);
//       console.log("wysz", response.data);
//     } catch (error) {
//       console.error('Error searching users', error);
//     } finally {
//       setLoading(false);  
//     }
//   };

//   const startChat = async (recipientId) => {
//     try {
//       const response = await api.post('/message/start-chat', { recipientId }, { withCredentials: true });
//       const { roomId } = response.data;
//       navigate(`/chat/${roomId}`);
//     } catch (error) {
//       console.error('Error starting chat', error);
//     }
//   };

//   return (
//     <div className="room-list-container">
//       <h2>Lista czatów</h2>
      
//       <div className="search-bar">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}  
//           placeholder="Wyszukaj użytkownika"
//         />
//         <button onClick={searchUsers} disabled={loading}>
//           {loading ? 'Ładowanie...' : <i className="fas fa-search"></i>}
//         </button>
//       </div>

//       <div className="search-results">
//         {searchResults.length > 0 ? (
//           <ul>
//             {searchResults.map((user) => (
//               <li key={user.id}>
//                 <span>{user.username}</span>
//                 <span>
//                   {isUserOnline(user.username) ? ' (Online)' : ' (Offline)'}
//                 </span>
//                 <button onClick={() => startChat(user.id)}>Rozpocznij czat</button>
//               </li>
//             ))}
//           </ul>
//         ) : searchTerm ? (
//           <p>Brak użytkowników pasujących do tego zapytania.</p>
//         ) : null}
//       </div>

//       <h3>Twoje czaty</h3>
//       <div className="room-list">
//         <ul>
//           {rooms.map((room) => (
//             <li key={room.id}>
//               <Link to={`/chat/${room.id}`}>
//                 {room.user2}
//                 {/* Dodajemy status online/offline przy nazwie użytkownika */}
//                 <span>
//                   {isUserOnline(room.user2) ? ' (Online)' : ' (Offline)'}
//                 </span>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default RoomList;




// import React, { useState, useEffect } from 'react';  
// import { useNavigate } from 'react-router-dom';      
// import api from '../services/api';                          
// import { Link } from 'react-router-dom';            
// import './CSS/RoomList.css';
// import { useSocket } from './SocketContext';

// const RoomList = () => {
//   const [rooms, setRooms] = useState([]);           
//   const [searchTerm, setSearchTerm] = useState('');  
//   const [searchResults, setSearchResults] = useState([]); 
//   const [loading, setLoading] = useState(false);     
//   const [profilePictures, setProfilePictures] = useState({});
//   const navigate = useNavigate();  
//   const { onlineUsers, isUserOnline } = useSocket();  

//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         const response = await api.get('/message/rooms', { withCredentials: true });
//         setRooms(response.data);
//         console.log(response.data);

//         const promises = response.data.map(async (i) => {
//           try {
//             const profilePicRes = await api.get(`/auth/user/${i.user2}/picture`, { responseType: 'blob' });
//             const imgUrl = URL.createObjectURL(profilePicRes.data);
//             setProfilePictures((prev) => ({
//               ...prev,
//               [i.user2]: imgUrl,  
//             }));
//           } catch (picError) {
//             // Możesz pominąć logowanie błędów, aby nie wypisywały się w konsoli
//             // console.log("Błąd pobierania zdjęcia profilowego:", picError.response?.data);
            
//             // Ustawienie domyślnego zdjęcia, jeśli pobieranie się nie powiedzie
//             setProfilePictures((prev) => ({
//               ...prev,
//               [i.user2]: 'https://localhost:5007/uploads/default_photo.jpg',
//             }));
//           }
//         });

//         await Promise.all(promises);
//       } catch (error) {
//         console.error('Error fetching rooms', error);
//       }
//     };

//     fetchRooms();  
//   }, []);

//   const searchUsers = async () => {
//     if (!searchTerm.trim()) return;

//     setLoading(true);  
//     try {
//       const response = await api.get(`/message/search-user/${searchTerm}`, { withCredentials: true });
//       setSearchResults(response.data);
//       console.log("wysz", response.data);
//     } catch (error) {
//       console.error('Error searching users', error);
//     } finally {
//       setLoading(false);  
//     }
//   };

//   const startChat = async (recipientId) => {
//     try {
//       const response = await api.post('/message/start-chat', { recipientId }, { withCredentials: true });
//       const { roomId } = response.data;
//       navigate(`/chat/${roomId}`);
//     } catch (error) {
//       console.error('Error starting chat', error);
//       alert('Wystąpił problem podczas uruchamiania czatu');
//     }
//   };

//   return (
//     <div className="room-list-container">
//       <h2>Lista czatów</h2>
      
//       <div className="search-bar">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}  
//           placeholder="Wyszukaj użytkownika"
//         />
//         <button onClick={searchUsers} disabled={loading}>
//           {loading ? 'Ładowanie...' : <i className="fas fa-search"></i>}
//         </button>
//       </div>

//       <div className="search-results">
//         {searchResults.length > 0 ? (
//           <ul>
//             {searchResults.map((user) => (
//               <li key={user.id}>
//                 <span>{user.username}</span>
//                 <span>
//                   {isUserOnline(user.username) ? ' (Online)' : ' (Offline)'}
//                 </span>
//                 <button onClick={() => startChat(user.id)}>Rozpocznij czat</button>
//               </li>
//             ))}
//           </ul>
//         ) : searchTerm ? (
//           <p>Brak użytkowników pasujących do tego zapytania.</p>
//         ) : null}
//       </div>

//       <h3>Twoje czaty</h3>
//       <div className="room-list">
//         <ul>
//           {rooms.map((room) => (
//             <li key={room.id}>
//               <Link to={`/chat/${room.id}`}>
//               {console.log(profilePictures)}
//               {/* <img 
//                 src={profilePictures[room.user2] || 'https://localhost:5007/uploads/default_photo.jpg'} 
//                 alt={`${room.user2} profil`} 
//                 className="profile-pic" 
//               /> */}
//               {console.log(profilePictures[room.user2])};

//               <img
//                 src={profilePictures[room.user2] ? profilePictures[room.user2] : 'https://localhost:5007/uploads/default_photo.jpg'}
//                 alt="Profile"
//                 className="profile-pic"
//               />


//                 {room.user2}
//                 {/* Dodajemy status online/offline przy nazwie użytkownika */}
//                 {/* <span>
//                   {isUserOnline(room.user2) ? ' (Online)' : ' (Offline)'}
//                 </span> */}
//                 <span 
//                   className={`status-dot ${isUserOnline(room.user2) ? 'online-status' : 'offline-status'}`}
//                 ></span>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default RoomList;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './CSS/RoomList.css';
import { useSocket } from './SocketContext';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});
  const navigate = useNavigate();
  const { onlineUsers, isUserOnline } = useSocket();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/message/rooms', { withCredentials: true });
        setRooms(response.data);

        const promises = response.data.map(async (i) => {
          try {
            const profilePicRes = await api.get(`/auth/user/${i.user2}/picture`, { responseType: 'blob' });
            const imgUrl = URL.createObjectURL(profilePicRes.data);
            setProfilePictures((prev) => ({
              ...prev,
              [i.user2]: imgUrl,
            }));
          } catch (picError) {
            console.error("Error loading profile picture:", picError);
            setProfilePictures((prev) => ({
              ...prev,
              [i.user2]: 'https://localhost:5007/uploads/default_photo.jpg', 
            }));
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error('Error fetching rooms', error);
      }
    };

    fetchRooms();
  }, []);

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/message/search-user/${searchTerm}`, { withCredentials: true });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (recipientId) => {
    try {
      const response = await api.post('/message/start-chat', { recipientId }, { withCredentials: true });
      const { roomId } = response.data;
      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error('Error starting chat', error);
      alert('Wystąpił problem podczas uruchamiania czatu');
    }
  };

  return (
    <div className="room-list-container">
      <h2>Lista czatów</h2>

      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Wyszukaj użytkownika"
        />
        <button onClick={searchUsers} disabled={loading}>
          {loading ? 'Ładowanie...' : <i className="fas fa-search"></i>}
        </button>
      </div>

      <div className="search-results">
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((user) => (
              <li key={user.id}>
                <span>{user.username}</span>
                <span>
                  {isUserOnline(user.username) ? ' (Online)' : ' (Offline)'}
                </span>
                <button onClick={() => startChat(user.id)}>Rozpocznij czat</button>
              </li>
            ))}
          </ul>
        ) : searchTerm ? (
          <p>Brak użytkowników pasujących do tego zapytania.</p>
        ) : null}
      </div>

      <h3>Twoje czaty</h3>
      <div className="room-list">
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <Link to={`/chat/${room.id}`}>
                <img
                  src={profilePictures[room.user2] || 'https://localhost:5007/uploads/default_photo.jpg'}
                  alt={`${room.user2} profil`}
                  className="profile-pic"
                />
                {room.user2}
                <span className={`status-dot ${isUserOnline(room.user2) ? 'online-status' : 'offline-status'}`}></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;
