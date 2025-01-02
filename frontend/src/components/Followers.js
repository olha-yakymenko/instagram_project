import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const Followers = ({ type }) => {
    const { user } = useAuth();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const endpoint = type === 'followers'
            ? `/followers/${user.id}/followers`
            : `/followers/${user.id}/following`;
          const response = await api.get(endpoint);
          setList(response.data);
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
              {type === 'following' && (
                <button onClick={() => handleUnsubscribe(item.id)}>Usuń subskrypcję</button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
export default Followers;
