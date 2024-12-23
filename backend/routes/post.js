const express = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Cookie Parser
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();
router.use(cookieParser()); 

const authenticate = (req, res, next) => {
    const token = req.cookies && req.cookies.token; 
  
    if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w ciasteczkach' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      console.log('Token zweryfikowany:', decoded); 
      next(); 
    } catch (error) {
      console.error('Błąd weryfikacji tokenu:', error);
      return res.status(401).json({ error: 'Niepoprawny lub wygasły token' });
    }
  };
  
