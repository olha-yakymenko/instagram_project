import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { TextField, Button, Typography } from '@mui/material';
import './CSS/Login.css';

const Login = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
  });
  const { login, error, loading } = useAuth(); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(userData.username, userData.password);
  };

  return (
    <div className="login-container">
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <TextField
            label="Username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={userData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
          disabled={loading}
        >
          Login
        </Button>
      </form>

      <Typography style={{ marginTop: '20px' }}>
        Don't have an account? <a href="/register">Register here</a>
      </Typography>
    </div>
  );
};

export default Login;
