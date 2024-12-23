const express = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');  
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
  

  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); 
  }
  
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'uploads/'); 
      },
      filename: function (req, file, cb) {
          const timestamp = Date.now();
          const originalName = path.parse(file.originalname).name; 
          const extension = path.extname(file.originalname); 
          const newName = `${timestamp}-${originalName}${extension}`;
          cb(null, newName);  
      }
  });
  const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (allowedTypes.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb(new Error('Nieprawidłowy typ pliku. Dozwolone są: JPEG, PNG, GIF.'));
          }
      },
  });
  
  router.use('/uploads', express.static(uploadDir));
  