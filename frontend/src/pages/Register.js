// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../components/AuthContext';
// import { TextField, Button, Typography } from '@mui/material';
// import './CSS/Register.css'

// const Register = () => {
//   const [userData, setUserData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { register } = useAuth();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await register(userData.username, userData.password); 
//       navigate('/'); 
//     } catch (err) {
//       setError(err.response?.data?.error || 'Something went wrong');
//     }
//   };

//   return (
//     <div className="register-container"> 
//       <Typography variant="h4" gutterBottom>
//         Signup
//       </Typography>
//       {error && (
//         <Typography color="error" gutterBottom>
//           {error}
//         </Typography>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div className="form-group"> 
//           <label htmlFor="username">Username:</label>
//           <TextField
//             label="Username"
//             name="username"
//             value={userData.username}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <div className="form-group"> 
//           <label htmlFor="email">Email:</label>
//           <TextField
//             label="Email"
//             name="email"
//             type="email"
//             value={userData.email}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <div className="form-group"> 
//           <label htmlFor="password">Password:</label>
//           <TextField
//             label="Password"
//             name="password"
//             type="password"
//             value={userData.password}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           style={{ marginTop: '20px' }}
//         >
//           Signup
//         </Button>
//       </form>
//       <Typography style={{ marginTop: '20px' }}>
//         Already have an account? <a href="/login">Login here</a>
//       </Typography>
//     </div>
//   );
// };

// export default Register;


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../components/AuthContext';
// import { TextField, Button, Typography } from '@mui/material';
// import './CSS/Register.css';

// const Register = () => {
//   const [userData, setUserData] = useState({
//     username: '',
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const { register, loading, error: authError } = useAuth(); // Pobieramy błąd z kontekstu

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserData({ ...userData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');  // Zerowanie poprzednich błędów

//     // Próba rejestracji
//     register(userData.username, userData.password);

//     // Sprawdzamy czy w AuthContext jest błąd
//     if (authError) {
//       setError(authError);  // Jeśli wystąpił błąd, wyświetlamy go
//     } else {
//       navigate('/');  // Jeśli rejestracja przebiegła pomyślnie, przechodzimy na stronę główną
//     }
//   };

//   return (
//     <div className="register-container">
//       <Typography variant="h4" gutterBottom>
//         Signup
//       </Typography>

//       {/* Wyświetlanie błędów */}
//       {error && (
//         <Typography color="error" gutterBottom>
//           {error}
//         </Typography>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="username">Username:</label>
//           <TextField
//             label="Username"
//             name="username"
//             value={userData.username}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="email">Email:</label>
//           <TextField
//             label="Email"
//             name="email"
//             type="email"
//             value={userData.email}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="password">Password:</label>
//           <TextField
//             label="Password"
//             name="password"
//             type="password"
//             value={userData.password}
//             onChange={handleInputChange}
//             fullWidth
//             margin="normal"
//           />
//         </div>
//         <Button
//           type="submit"
//           variant="contained"
//           color="primary"
//           fullWidth
//           style={{ marginTop: '20px' }}
//           disabled={loading} // Disabled button when loading
//         >
//           Signup
//         </Button>
//       </form>

//       <Typography style={{ marginTop: '20px' }}>
//         Already have an account? <a href="/login">Login here</a>
//       </Typography>
//     </div>
//   );
// };

// export default Register;


import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { TextField, Button, Typography } from '@mui/material';
import './CSS/Register.css';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const { register, error, loading } = useAuth(); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register(userData.username, userData.password);
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
          disabled={loading}
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
