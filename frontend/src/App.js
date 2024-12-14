import React from 'react';
import { BrowserRouter as Router} from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
