import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const Followers = ({ type, userName }) => {
    const { user } = useAuth();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('')
    useEffect(() => {
      const fetchData = async () => {
        try {
          const userId = await api.get(`/auth/user-id/${userName}`);
          console.log("Odpowiedź API:", userId.data);
          setUserId(userId.data.id)
          const endpoint = type === 'followers'
            ? `/followers/${userId.data.id}/followers`
            : `/followers/${userId.data.id}/following`;
          const response = await api.get(endpoint);
          setList(response.data);
          console.log("podp", response.data)
        } catch (error) {
          console.error(`Błąd podczas pobierania ${type}:`, error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [type, user.id]);

    const handleUnsubscribe = async (followingId) => {
        try {
          await api.delete(`/followers/unsubscribe1/${user.id}/${followingId}`);
          setList((prev) => prev.filter((item) => item.id !== followingId));
        } catch (error) {
          console.error('Błąd podczas usuwania subskrypcji:', error);
        }
      };
      
  
    if (loading) return <p>Ładowanie danych...</p>;
  
    return (
      <div>
        <h2>{type === 'followers' ? 'Twoi obserwatorzy' : 'Subskrybowani użytkownicy'}</h2>
        <ul>
          {list.map((item) => (
            <li key={item.id}>
              {item.username}
              {user.id===userId && type === 'following' && (
                <button onClick={() => handleUnsubscribe(item.id)}>Usuń subskrypcję</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
export default Followers;
