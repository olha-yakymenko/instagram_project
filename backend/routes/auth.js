const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cookieParser = require('cookie-parser');
const multer = require("multer")

const router = express.Router();
router.use(cookieParser());

const fs = require('fs');
const path = require('path');

const authenticate = (req, res, next) => {
  const token = req.cookies[`auth_token_${req.params.username}`];  

  console.log('Received token:', token);

  if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w ciasteczkach' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  

      console.log('Decoded token:', decoded); 
      req.user = decoded;  
      next();  
  } catch (error) {
      console.error('Błąd weryfikacji tokenu:', error);
      return res.status(401).json({ error: 'Niepoprawny lub wygasły token' });
  }
};


function loadDefaultProfilePicture() {
    const defaultImagePath = path.join(__dirname, '..', 'uploads', 'default_photo.jpg');
    if (!fs.existsSync(defaultImagePath)) {
        throw new Error('Default profile picture not found');
    }
    return fs.readFileSync(defaultImagePath);
}


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultProfilePicture = loadDefaultProfilePicture();

        const newUser = await User.create({
            username,
            password: hashedPassword,  
            profile_picture: defaultProfilePicture,  
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const payload = {
            id: user.id,       
            username: user.username,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '6h', 
        });

        res.cookie(`auth_token_${user.username}`, token, {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production' ? true : false,
            maxAge: 6 * 60 * 60 * 1000, 
            sameSite: 'None',
        });
        console.log("USTAW", token)
        console.log('Ciasteczka:', req.cookies);

        res.json({ message: 'Login successful', username: user.username, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/user/:username', async (req, res) => {
    const token = req.cookies[`auth_token_${req.params.username}`]; 
    console.log(token)
    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w ciasteczkach' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { username } = req.params;

        if (decoded.username !== username) {
            return res.status(403).json({ error: 'Access denied, username mismatch' });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Token verification error:', error);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Token expired' });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        return res.status(500).json({ error: 'Server error' });
    }
});


router.get('/user-id/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

const storage = multer.memoryStorage();  
const upload = multer({ storage: storage }); 
router.put('/user/:userId/profile-picture', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.profile_picture = req.file.buffer;
        await user.save();

        res.json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/user/:userId/profile-picture', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.profile_picture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        res.setHeader('Content-Type', 'image/jpeg'); 
        res.send(user.profile_picture); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/user/:username/picture', async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.profile_picture) {
            return res.status(404).json({ error: 'Profile picture not found' });
            // const defaultImagePath = path.join(__dirname, '../uploads/default_photo.jpg');
            // imageBuffer = fs.readFileSync(defaultImagePath); 
            // contentType = 'image/jpeg'; 
        }

        res.setHeader('Content-Type', 'image/jpeg'); 
        res.send(user.profile_picture); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.put('/update-username', authenticate, async (req, res) => {
    const { username } = req.body;
  
    try {
      const user = await User.findOne({ where: { id: req.user.id } });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Nie znaleziono użytkownika' });
      }
  
      const existingUser = await User.findOne({ where: { username } });
  
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'To imię jest już zajęte' });
      }
  
      const oldUsername = user.username; 
      user.username = username; 
  
      await user.save();
  
      return res.json({ 
        success: true, 
        message: `Imię użytkownika zostało zmienione z ${oldUsername} na ${username}` 
      });
  
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error);
      return res.status(500).json({ success: false, message: 'Wystąpił błąd podczas aktualizacji.' });
    }
  });
  
module.exports = router;
