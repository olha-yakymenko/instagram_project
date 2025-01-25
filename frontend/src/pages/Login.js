// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../components/AuthContext';
// import { TextField, Button, Typography } from '@mui/material';
// import './CSS/Login.css'

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(''); 

//     try {
//       await login(username, password);  
//       navigate('/'); 
//     } catch (error) {
//       console.error('Login failed:', error.response?.data?.error || error.message);
//       setError(error.response?.data?.error || 'Login failed'); 
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <TextField
//             label="Username"
//             type="text"
//             fullWidth
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//             sx={{
//               marginBottom: 2,
//               '& .MuiInputBase-root': {
//                 borderRadius: '8px',
//                 borderColor: '#ddd',
//               },
//             }}
//           />
//         </div>
//         <div className="form-group">
//           <TextField
//             label="Password"
//             type="password"
//             fullWidth
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             sx={{
//               marginBottom: 2,
//               '& .MuiInputBase-root': {
//                 borderRadius: '8px',
//                 borderColor: '#ddd',
//               },
//             }}
//           />
//         </div>
//         {error && (
//           <Typography color="error" sx={{ marginBottom: 2 }}>
//             {error} 
//           </Typography>
//         )}
//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           sx={{
//             padding: '12px',
//             backgroundColor: '#3f51b5',
//             '&:hover': {
//               backgroundColor: '#303f9f',
//             },
//           }}
//         >
//           Login
//         </Button>
//       </form>
//       <Typography sx={{ marginTop: 2 }}>
//         Don't have an account? <a href="/register">Register here</a>
//       </Typography>
//     </div>
//   );
// };

// export default Login;


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
