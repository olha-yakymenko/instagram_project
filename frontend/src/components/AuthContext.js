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
    const [error, setError] = useState(''); 

    const checkUser = (token, username) => {
        console.log("WYS", username)
        return axios.get(`/auth/user/${username}`, {
            withCredentials: true,
        });
    };

    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username');
        const token = Cookies.get(`auth_token_${storedUsername}`);

        if (storedUsername && token) {
            checkUser(token, storedUsername)
                .then((response) => {
                    setUser(response.data);
                    setUsername(storedUsername);
                })
                .catch((error) => {
                    setUser(null);
                    setUsername(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);  
        }
    }, [sessionStorage.getItem('username')]);


    const handleError = (error) => {
        if (error.response) {
            const errorMessage = error.response.data.error || 'Something went wrong';
            if (error.response.status === 400) {
                if (errorMessage.includes('already exists')) {
                    setError('Użytkownik już istnieje!');
                } else if (errorMessage.includes('password')) {
                    setError('Hasło musi mieć co najmniej 6 znaków!');
                } else {
                    setError('Rejestracja nie powiodła się');
                }
            } else if (error.response.status === 500) {
                setError('Coś poszło nie tak, spróbuj ponownie później.');
            } else {
                setError('Nieoczekiwany błąd.');
            }
        } else {
            setError('Brak połączenia, sprawdź swoje połączenie internetowe.');
        }
    };

    const login = (username, password) => {
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
                handleError(error); 
            })
            .finally(() => {
                setLoading(false);  
            });
    };

    const register = (username, password) => {
        setLoading(true);
        axios
          .post('/auth/register', { username, password }, { withCredentials: true })
          .then((response) => {
            console.log('User registered:', response.data);
            navigate('/login');
          })
          .catch((error) => {
            handleError(error); 
          })
          .finally(() => {
            setLoading(false);
          });
    };

    const logout = async () => {
        try {
            Cookies.remove(`auth_token_${username}`);
            sessionStorage.removeItem('user');
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
        <AuthContext.Provider value={{ user, login, logout, register, error }}>
            {children}
        </AuthContext.Provider>
    );
};  
