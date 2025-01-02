import React, { useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';      
import api from '../services/api';                          
import { Link } from 'react-router-dom';            
import './CSS/RoomList.css'
const RoomList = () => {
  const [rooms, setRooms] = useState([]);           
  const [searchTerm, setSearchTerm] = useState('');  
  const [searchResults, setSearchResults] = useState([]); 
  const [loading, setLoading] = useState(false);     
  const navigate = useNavigate();                   

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/message/rooms', { withCredentials: true });
        setRooms(response.data)
        console.log(response.data); 
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
      console.log("wysz", response.data)
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
                {room.user2}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;
