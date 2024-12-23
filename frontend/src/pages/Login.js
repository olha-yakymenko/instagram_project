
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { TextField, Button, Typography } from '@mui/material';
import './CSS/Login.css'

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      login(username, password);
      navigate('/'); 
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <TextField
            label="Username"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              marginBottom: 2,  
              '& .MuiInputBase-root': {
                borderRadius: '8px', 
                borderColor: '#ddd', 
              },
            }}
          />
        </div>
        <div className="form-group">
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              marginBottom: 2,
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                borderColor: '#ddd',
              },
            }}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            padding: '12px',
            backgroundColor: '#3f51b5',
            '&:hover': {
              backgroundColor: '#303f9f', 
            },
          }}
        >
          Login
        </Button>
      </form>
      <Typography sx={{ marginTop: 2 }}>
        Don't have an account? <a href="/register">Register here</a>
      </Typography>
    </div>
  );
};

export default Login;

