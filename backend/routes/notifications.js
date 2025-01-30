const express = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const Notification = require('../models/notification') 
const router = express.Router();


const authenticate = (req, res, next) => {
    const username = req.headers['x-username'];

    console.log('Received username:', username);

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const token = req.cookies[`auth_token_${username}`];

    console.log('Received token from cookies:', token);

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



router.get('/:userId', authenticate, async (req, res) => {
    const { userId } = req.params;  

    try {
        const notifications = await Notification.findAll({
            where: {
                userId: userId, 
            },
            include: [
                { model: User, as: 'user', attributes: ['username'] },  
                { model: Post, as: 'Post', attributes: ['id'] },  
                { model: Comment, as: 'Comment', attributes: ['id', 'content'] },  
            ],
            order: [['createdAt', 'DESC']], 
        });

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Something went wrong while fetching notifications' });
    }
});


module.exports = router;
