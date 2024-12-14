
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext); 
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);


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

  return (
    <AuthContext.Provider value={{ user}}>
      {children}
    </AuthContext.Provider>
  );
};
