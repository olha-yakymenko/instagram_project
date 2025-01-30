import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'https://localhost:5007/api',
    withCredentials: true,  
});

api.interceptors.request.use((config) => {
    const username = sessionStorage.getItem('username'); 

        console.log('Otrzymany username:', username);

    if (username) {
        const token = Cookies.get(`auth_token_${username}`); 

        console.log("TOKEN", token); 
        config.headers['X-Username'] = username;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;


