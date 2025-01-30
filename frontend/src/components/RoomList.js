import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './CSS/RoomList.css';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profilePictures, setProfilePictures] = useState({});
  const [chatUsers, setChatUsers] = useState({}); 
  
  const navigate = useNavigate();
  const { onlineUsers, isUserOnline } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/message/rooms', { withCredentials: true });
        setRooms(response.data);

        const usersMap = {};
        const promises = response.data.map(async (room) => {
          const chatUser = room.user1 === user.username ? room.user2 : room.user1;
          usersMap[room.id] = chatUser;

          try {
            const profilePicRes = await api.get(`/auth/user/${chatUser}/picture`, { responseType: 'blob',
              validateStatus: (status) => status === 200 || status === 404 });
            const imgUrl = URL.createObjectURL(profilePicRes.data);
            console.log(chatUser, imgUrl)
            setProfilePictures((prev) => ({
                ...prev,
                [chatUser]: imgUrl,
            }));
        } catch (error){
            setProfilePictures((prev) => ({
                ...prev,
                [chatUser]: 'https://localhost:5007/uploads/default_photo.jpg',
            }));
        }
        
        });

        await Promise.all(promises);
        setChatUsers(usersMap);
      } catch (error) {
        console.error('Error fetching rooms', error);
      }
    };

    fetchRooms();
  }, [user.username]);

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
  {rooms.map((room) => {
    const chatUser = chatUsers[room.id]; 
    return (
      <li key={room.id}>
        <Link to={`/chat/${room.id}`}>
          <img
            src={profilePictures[chatUser] || 'https://localhost:5007/uploads/default_photo.jpg'}
            alt={`${chatUser} profil`}
            className="profile-pic"
          />
          {chatUser}
          <span className={`status-dot ${isUserOnline(chatUser) ? 'online-status' : 'offline-status'}`}></span>
        </Link>
      </li>
    );
  })}
</ul>

      </div>
    </div>
  );
};

export default RoomList;
