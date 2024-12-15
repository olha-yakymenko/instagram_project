
const express = require('express');
const { Op } = require('sequelize');
const Message = require('../models/message');
const Room = require('../models/room');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticate = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.status(401).json({ error: 'No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded; 
        console.log('Verified token:', decoded); 
        next();
    } catch (error) {
        console.error('Error during verifying token:', error);
        return res.status(401).json({ error: 'Bad or expired token' });
    }
};

router.get('/search-user/:username', authenticate, async (req, res) => {
    const { username } = req.params;

    try {
        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${username}%`, 
                },
            },
            attributes: ['id', 'username'],
        });

        if (users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        res.json(users);
    } catch (err) {
        console.error('Error during user search:', err);
        res.status(500).json({ error: 'Server error during user search' });
    }
});

router.post('/start-chat', authenticate, async (req, res) => {
    const { recipientId } = req.body;

    try {
        const recipient = await User.findByPk(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        const [room] = await Room.findOrCreate({
            where: {
                [Op.or]: [
                    { user1Id: req.user.id, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: req.user.id },
                ],
            },
            defaults: {
                user1Id: req.user.id,
                user2Id: recipientId,
            },
        });

        res.json({ roomId: room.id, message: 'Chat started successfully' });
    } catch (err) {
        console.error('Error during chat start:', err);
        res.status(500).json({ error: 'Server error during chat start' });
    }
});

router.get('/rooms', authenticate, async (req, res) => {
    try {
        const loggedInUserId = req.user.id; 

        console.log('Fetching chat rooms for user:', loggedInUserId);

        const rooms = await Room.findAll({
            include: [
                {
                    model: User,
                    as: 'User1',
                    attributes: ['id', 'username'],
                },
                {
                    model: User,
                    as: 'User2',
                    attributes: ['id', 'username'],
                },
            ],
            where: {
                [Op.or]: [
                    { user1Id: loggedInUserId }, 
                    { user2Id: loggedInUserId }, 
                ],
            },
        });

        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ error: 'No chat rooms found for the user' });
        }

        const formattedRooms = rooms.map(room => ({
            id: room.id,
            user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
            user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
        }));

        console.log('Chat rooms for user:', formattedRooms);
        res.json(formattedRooms);
    } catch (err) {
        console.error('Error while fetching chat rooms for user:', err);
        res.status(500).json({ error: 'Error while fetching chat rooms' });
    }
});