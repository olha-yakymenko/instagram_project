import React, { useState } from 'react';
import api from '../services/api'; 
import Post from '../components/Post'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../components/AuthContext'
import './CSS/Search.css'

const Search = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 
  const {user}=useAuth()

  const fetchPosts = async (username) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/search?username=${username}`, {
      });

      if (response.data.length === 0) {
        setError('Brak postów dla tego użytkownika');
      } else {
        setPosts(response.data);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.response?.status === 404 ? 'Brak użytkownika' : 'Błąd pobierania postów');
      console.error('Error fetching posts:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(username);
  };

  const handleProfileClick = (user) => {
    navigate(`/profile/${user}`); 
  };

  return (
    <div className="search">
      <h2>Wyszukaj posty użytkownika</h2>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Wprowadź nazwę użytkownika"
        />
        <button type="submit">Szukaj</button>
      </form>

      {loading ? (
        <p>Ładowanie postów...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="posts">
          {posts.map((userPosts, index) => (
            <div key={index}>
              <h3>
                <button className="username"     
                onClick={() => {
                if (user?.username) {
                  handleProfileClick(userPosts.user);
                }
              }} >
                  {userPosts.user}
                </button>
              </h3>
              {userPosts.posts.length === 0 ? (
                <p>Brak postów</p>
              ) : (
                userPosts.posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;


