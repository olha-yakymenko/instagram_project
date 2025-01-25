
const express = require('express');
const { Op } = require('sequelize');
const Message = require('../models/message');
const Room = require('../models/room');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const router = express.Router();


// const authenticate = (req, res, next) => {
//     console.log("Cookies", req.cookies)
//     const token = req.cookies.token; 
//     if (!token) {
//         return res.status(401).json({ error: 'No token' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET); 
//         req.user = decoded; 
//         console.log('Verified token:', decoded); 
//         next();
//     } catch (error) {
//         console.error('Error during verifying token:', error);
//         return res.status(401).json({ error: 'Bad or expired token' });
//     }
// };

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    console.log('Received token:', token); 

    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w nagłówkach' });
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

router.get('/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {
        const messages = await Message.findAll({ where: { roomId } });
        if (messages.length === 0) {
            return res.status(404).json({ error: 'No messages found in this room' });
        }
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Server error while fetching messages' });
    }
});

// function socketSetup(io) {
//     io.on('connection', (socket) => {
//         console.log('User connected to WebSocket', socket.id);
//         console.log(socket.handshake)
//         const token = socket.handshake.auth.token;
//         console.log('Received token:', token);

//         if (!token) {
//             console.log('Authentication error: No token');
//             socket.disconnect(); 
//             return;
//         }

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET); 
//             socket.user = decoded; 
//             console.log('Authenticated user:', socket.user);
//         } catch (error) {
//             console.log('Authentication error:', error);
//             socket.disconnect(); 
//             return;
//         }

//         socket.on('joinRoom', async ({ roomId }) => {
//             if (!roomId) {
//                 console.log('Error: Missing roomId');
//                 return;
//             }
        
//             socket.join(roomId);
//             console.log(`User ${socket.id} joined room ${roomId}`);
        
//             try {
//                 const room = await Room.findOne({
//                     where: { id: roomId },
//                     include: [
//                         { model: User, as: 'User1', attributes: ['id', 'username'] },
//                         { model: User, as: 'User2', attributes: ['id', 'username'] },
//                     ],
//                 });
        
//                 if (room) {
//                     const roomInfo = {
//                         user1: room.User1?.username || 'Nieznany użytkownik',
//                         user2: room.User2?.username || 'Nieznany użytkownik',
//                     };
//                     socket.emit('roomInfo', roomInfo);
//                 } else {
//                     console.log('Room not found for roomId:', roomId);
//                 }
        
//                 const messages = await Message.findAll({
//                     where: { roomId },
//                     include: [
//                         {
//                             model: User,
//                             attributes: ['id', 'username'], 
//                         },
//                     ],
//                     order: [['timestamp', 'ASC']], 
//                 });
        
//                 const formattedMessages = messages.map(message => ({
//                     id: message.id,
//                     content: message.content,
//                     timestamp: message.timestamp,
//                     roomId: message.roomId,
//                     senderUsername: message.User?.username || 'Nieznany użytkownik',
//                 }));
        
//                 socket.emit('loadMessages', formattedMessages); 
//             } catch (err) {
//                 console.error('Error fetching room info or messages:', err);
//             }
//         });
        
//         socket.on('sendMessage', async (messageData) => {
//             console.log('Received messageData:', messageData);
        
//             if (!messageData.roomId || !messageData.content) {
//                 console.log('Error: Missing roomId or content');
//                 return;
//             }
        
//             try {
//                 const sender = await User.findOne({
//                     where: { id: socket.user.id },
//                     attributes: ['id', 'username'],
//                 });
        
//                 if (!sender) {
//                     console.log('Error: Sender not found');
//                     return;
//                 }
        
//                 const message = await Message.create({
//                     roomId: messageData.roomId,
//                     content: messageData.content,
//                     userId: sender.id,
//                     timestamp: new Date(),
//                 });
        
//                 console.log('Message created:', message);
        
//                 const newMessage = {
//                     id: message.id,
//                     content: message.content,
//                     timestamp: message.timestamp,
//                     roomId: message.roomId,
//                     senderUsername: sender.username, 
//                 };
        
//                 io.to(messageData.roomId).emit('newMessage', newMessage);
//             } catch (err) {
//                 console.error('Error sending message via WebSocket:', err);
//             }
//         });
        
//         socket.on('disconnect', () => {
//             console.log('User disconnected from WebSocket', socket.id);
//         });
//     });
// }

let onlineUsers = {};  

function socketSetup(io) {
    io.on('connection', (socket) => {
        console.log('User connected to WebSocket', socket.id);
        console.log(socket.handshake);
        const token = socket.handshake.auth.token;
        console.log('Received token:', token);

        if (!token) {
            console.log('Authentication error: No token');
            socket.disconnect();
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            console.log('Authenticated user:', socket.user);
            console.log("USERAUTH", socket.user.id)
            onlineUsers[socket.user.id] = socket.user.username;
            console.log('Current online users:', onlineUsers);
            console.log(Object.keys(onlineUsers).map(userId => ({
                userId,
                username: socket.user.username 
              })))

        io.emit('userOnline', onlineUsers)

        } catch (error) {
            console.log('Authentication error:', error);
            socket.disconnect();
            return;
        }

        socket.on('joinRoom', async ({ roomId }) => {
            if (!roomId) {
                console.log('Error: Missing roomId');
                return;
            }
        
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        
            try {
                const room = await Room.findOne({
                    where: { id: roomId },
                    include: [
                        { model: User, as: 'User1', attributes: ['id', 'username'] },
                        { model: User, as: 'User2', attributes: ['id', 'username'] },
                    ],
                });
        
                if (room) {
                    const roomInfo = {
                        user1: room.User1?.username || 'Nieznany użytkownik',
                        user2: room.User2?.username || 'Nieznany użytkownik',
                    };
                    socket.emit('roomInfo', roomInfo);
                } else {
                    console.log('Room not found for roomId:', roomId);
                }
        
                const messages = await Message.findAll({
                    where: { roomId },
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'username'], 
                        },
                    ],
                    order: [['timestamp', 'ASC']], 
                });
        
                const formattedMessages = messages.map(message => ({
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp,
                    roomId: message.roomId,
                    senderUsername: message.User?.username || 'Nieznany użytkownik',
                }));
        
                socket.emit('loadMessages', formattedMessages); 
            } catch (err) {
                console.error('Error fetching room info or messages:', err);
            }
        });

        socket.on('sendMessage', async (messageData) => {
            console.log('Received messageData:', messageData);
        
            if (!messageData.roomId || !messageData.content) {
                console.log('Error: Missing roomId or content');
                return;
            }
        
            try {
                const sender = await User.findOne({
                    where: { id: socket.user.id },
                    attributes: ['id', 'username'],
                });
        
                if (!sender) {
                    console.log('Error: Sender not found');
                    return;
                }
        
                const message = await Message.create({
                    roomId: messageData.roomId,
                    content: messageData.content,
                    userId: sender.id,
                    timestamp: new Date(),
                });
        
                console.log('Message created:', message);
        
                const newMessage = {
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp,
                    roomId: message.roomId,
                    senderUsername: sender.username, 
                };
        
                io.to(messageData.roomId).emit('newMessage', newMessage);
            } catch (err) {
                console.error('Error sending message via WebSocket:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from WebSocket', socket.id);

            // Usuń użytkownika z listy online
            if (socket.user && onlineUsers[socket.user.id]) {
                delete onlineUsers[socket.user.id];
                console.log('Current online users:', onlineUsers);

                // Emituj zdarzenie, że użytkownik jest offline
                io.emit('userOffline', { userId: socket.user.id });
            }
        });
    });
}

module.exports = {
    router,
    socketSetup,
};
