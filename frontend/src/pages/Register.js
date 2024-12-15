import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { TextField, Button, Typography } from '@mui/material';


const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      register(userData.username, userData.email, userData.password); 
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="register-container"> 
      <Typography variant="h4" gutterBottom>
        Signup
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
          <label htmlFor="email">Email:</label>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={userData.email}
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
        >
          Signup
        </Button>
      </form>
      <Typography style={{ marginTop: '20px' }}>
        Already have an account? <a href="/login">Login here</a>
      </Typography>
    </div>
  );
};

export default Register;
