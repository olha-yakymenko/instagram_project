
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; 
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); 
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = (auth_token, username) => {
    return axios.get(`http://localhost:5007/api/auth/user/${username}`, {
      headers: { Authorization: `Bearer ${auth_token}` },
      withCredentials: true, 
    });
  };

  useEffect(() => {
    const token = Cookies.get('token'); 
    const username = Cookies.get('username'); 
    if (token && username) {
      checkUser(token, username)
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          setUser(null); 
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (username, password) => {
    setLoading(true);
    axios
      .post('http://localhost:5000/api/auth/login', { username, password }, { withCredentials: true })
      .then((response) => {
        const token = response.data.token;
        console.log('Token otrzymany z serwera:', token); 
  
        console.log('Przed zapisem w cookies:', { token, username });
  
        Cookies.set('token', token);
        console.log('Token zapisany w cookies:', Cookies.get('auth_token'));  
        Cookies.set('username', username);
        console.log('Username zapisany w cookies:', Cookies.get('username'));
  
        return checkUser(token, username);
      })
      .then((response) => {
        setUser(response.data); 
        navigate('/'); 
      })
      .catch((error) => {
        console.error('Login failed:', error); 
      })
      .finally(() => {
        setLoading(false); 
      });
  };
  const register = (username, email, password) => {
    setLoading(true);
    axios
      .post('http://localhost:5000/api/auth/register', { username, email, password }, { withCredentials: true })
      .then((response) => {
        const token = response.data.token;
        Cookies.set('auth_token', token, { expires: 7 }); 
        Cookies.set('username', username, { expires: 7 }); 
        console.log('Registration successful:', response.data);

        return checkUser(token, username);
      })
      .then((response) => {
        setUser(response.data); 
        navigate('/login'); 
      })
      .catch((error) => {
        console.error('Registration failed:', error); 
      })
      .finally(() => {
        setLoading(false); 
      });
  };
  
  if (loading) {
    return <div>Loading...</div>; 
  }
  return (
    <AuthContext.Provider value={{ user, login, register}}>
      {children}
    </AuthContext.Provider>
  );
};
