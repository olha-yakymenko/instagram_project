const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cookieParser = require('cookie-parser');

const router = express.Router();
router.use(cookieParser());
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = await User.create({ username, password: await bcrypt.hash(password, 10) });
        res.status(201).json({ message: 'User registered', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    try {
      const user = await User.findOne({ where: { username } });
      console.log("USER",user)
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log('Invalid password');
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '6h' });
      console.log('JWT token generated:', token);
  
      res.cookie('auth_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'Lax',
      });

      res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error while logging in:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);  
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
