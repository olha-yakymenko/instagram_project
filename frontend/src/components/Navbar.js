import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaRegPlusSquare, FaRegHeart, FaUserCircle, FaComment  } from 'react-icons/fa';
import { useAuth } from './AuthContext';  
import './CSS/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth(); 
  
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">
            <FaHome className="navbar-icon" />
            Home
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/search" className="navbar-link">
            <FaSearch className="navbar-icon" />
            Search
          </Link>
        </li>
        
        {user ? (
          <>
          <li className="navbar-item">
          <Link to="/notifications" className="navbar-link">
            <FaRegHeart className="navbar-icon" />
            Posts
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/create-post" className="navbar-link">
            <FaRegPlusSquare className="navbar-icon" />
            Add Post
          </Link>
        </li>
            <li className="navbar-item">
            <Link to={`/profile/${user.username}`} className="navbar-link">
                <FaUserCircle className="navbar-icon" />
                Profile
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/chat" className="navbar-link">
                <FaComment className="navbar-icon" /> 
                Chat
              </Link>
            </li>
            <li className="navbar-item">
              <button
                className="navbar-link"
                onClick={logout} 
              >
                Logout
              </button>
            </li>
          </>
          
        ) : (
          <li className="navbar-item">
            <Link to="/login" className="navbar-link">
              <FaUserCircle className="navbar-icon" />
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
