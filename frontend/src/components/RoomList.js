import React, { useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';      
import axios from '../services/api';                          
import { Link } from 'react-router-dom';            

const RoomList = () => {
  const [rooms, setRooms] = useState([]);           
  const [searchTerm, setSearchTerm] = useState('');  
  const [searchResults, setSearchResults] = useState([]); 
  const [loading, setLoading] = useState(false);     
  const navigate = useNavigate();                   

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('message/rooms', { withCredentials: true });
        console.log(response.data); 
        setRooms(response.data);
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
      const response = await axios.get(`/message/search-user/${searchTerm}`, { withCredentials: true });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users', error);
    } finally {
      setLoading(false);  
    }
  };

  const startChat = async (recipientId) => {
    try {
      const response = await axios.post('/message/start-chat', { recipientId }, { withCredentials: true });
      const { roomId } = response.data;
      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error('Error starting chat', error);
    }
  };

  return (
    <div>
      <h2>Lista dostępnych pokoi</h2>
      
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}  
          placeholder="Wyszukaj użytkownika"
        />
        <button onClick={searchUsers} disabled={loading}>
          {loading ? 'Ładowanie...' : 'Szukaj'}
        </button>
      </div>

      <div>
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

      <h3>Twoje pokoje</h3>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link to={`/chat/${room.id}`}>
              Pokój między {room.user1 || 'Nieznany użytkownik'} a {room.user2 || 'Nieznany użytkownik'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomList;
