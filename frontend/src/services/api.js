
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:5007/api',
    withCredentials: true, 
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token'); 
    console.log("TOKEN", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
