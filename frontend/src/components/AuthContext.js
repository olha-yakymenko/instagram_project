import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);  
    const [loading, setLoading] = useState(true); 
    const [username, setUsername] = useState(null);
    const navigate = useNavigate();

    const checkUser = (token, username) => {
        return axios.get(`/auth/user/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
    };

    useEffect(() => {

        const storedUsername = sessionStorage.getItem('username');
        const token = Cookies.get(`auth_token_${storedUsername}`);

        console.log('Stored username and token:', storedUsername, token);

        if (storedUsername && token) {
            checkUser(token, storedUsername)
                .then((response) => {
                    console.log('User data:', response.data);
                    setUser(response.data);
                    setUsername(storedUsername);
                })
                .catch((error) => {
                    console.error('Error checking user:', error);
                    setUser(null);
                    setUsername(null);
                })
                .finally(() => {
                    console.log('Finished loading');
                    setLoading(false);
                });
        } else {
            console.log('No user or token in storage');
            setLoading(false);  
        }
    }, []);

    const login = (username, password) => {
        console.log("Logging in...");

        setLoading(true);
        axios
            .post('/auth/login', { username, password }, { withCredentials: true })
            .then((response) => {
                const token = response.data.token;
                const userUsername = response.data.username;

                Cookies.set(`auth_token_${userUsername}`, token, { expires: 7 });

                sessionStorage.setItem('username', userUsername);
                
                return checkUser(token, userUsername);
            })
            .then((response) => {
                setUser(response.data);
                setUsername(response.data.username);  
                navigate('/');  
            })
            .catch((error) => {
                console.error('Login failed:', error);  
            })
            .finally(() => {
                setLoading(false);  
            });
    };

    const logout = async () => {
        try {
            Cookies.remove(`auth_token_${username}`);
            sessionStorage.removeItem('username'); 
            setUser(null); 
            setUsername(null); 

            navigate('/login');  
        } catch (error) {
            console.error('Error during logout:', error);  
        }
    };

    if (loading) {
        return <div>Loading</div>;  
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children} 
        </AuthContext.Provider>
    );
};
