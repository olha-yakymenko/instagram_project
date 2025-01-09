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
            secure: process.env.NODE_ENV === 'production',
            maxAge: 6 * 60 * 60 * 1000, 
            sameSite: 'None',
        });

        res.json({ message: 'Login successful', username: user.username, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


router.get('/user/:username', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access denied, token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        const { username } = req.params;

        try {
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (decoded.username !== username) {
                return res.status(403).json({ error: 'Access denied' });
            }
            res.json(user);
        } catch (error) {
            console.error('Server error:', error); // Zalogowanie błędów serwera
            res.status(500).json({ error: 'Server error' });
        }
    });
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

module.exports = router;
