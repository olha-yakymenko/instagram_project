const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

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
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
