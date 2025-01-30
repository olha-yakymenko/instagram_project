
// const express = require('express');
// const { Op } = require('sequelize');
// const Message = require('../models/message');
// const Room = require('../models/room');
// const User = require('../models/user');
// const jwt = require('jsonwebtoken');
// const router = express.Router();


// const authenticate = (req, res, next) => {
//     const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

//     console.log('Received token:', token); 

//     if (!token) {
//         return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w nagłówkach' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded token:', decoded); 
//         req.user = decoded; 
//         next();
//     } catch (error) {
//         console.error('Błąd weryfikacji tokenu:', error);
//         return res.status(401).json({ error: 'Niepoprawny lub wygasły token' });
//     }
// };

// router.get('/search-user/:username', authenticate, async (req, res) => {
//     const { username } = req.params;

//     try {
//         const users = await User.findAll({
//             where: {
//                 username: {
//                     [Op.like]: `%${username}%`, 
//                 },
//             },
//             attributes: ['id', 'username'],
//         });

//         if (users.length === 0) {
//             return res.status(404).json({ error: 'No users found' });
//         }

//         res.json(users);
//     } catch (err) {
//         console.error('Error during user search:', err);
//         res.status(500).json({ error: 'Server error during user search' });
//     }
// });

// router.post('/start-chat', authenticate, async (req, res) => {
//     const { recipientId } = req.body;

//     try {
//         const recipient = await User.findByPk(recipientId);
//         if (!recipient) {
//             return res.status(404).json({ error: 'Recipient not found' });
//         }

//         const [room] = await Room.findOrCreate({
//             where: {
//                 [Op.or]: [
//                     { user1Id: req.user.id, user2Id: recipientId },
//                     { user1Id: recipientId, user2Id: req.user.id },
//                 ],
//             },
//             defaults: {
//                 user1Id: req.user.id,
//                 user2Id: recipientId,
//             },
//         });

//         res.json({ roomId: room.id, message: 'Chat started successfully' });
//     } catch (err) {
//         console.error('Error during chat start:', err);
//         res.status(500).json({ error: 'Server error during chat start' });
//     }
// });

// router.get('/rooms', authenticate, async (req, res) => {
//     try {
//         const loggedInUserId = req.user.id; 

//         console.log('Fetching chat rooms for user:', loggedInUserId);

//         const rooms = await Room.findAll({
//             include: [
//                 {
//                     model: User,
//                     as: 'User1',
//                     attributes: ['id', 'username'],
//                 },
//                 {
//                     model: User,
//                     as: 'User2',
//                     attributes: ['id', 'username'],
//                 },
//             ],
//             where: {
//                 [Op.or]: [
//                     { user1Id: loggedInUserId }, 
//                     { user2Id: loggedInUserId }, 
//                 ],
//             },
//         });

//         if (!rooms || rooms.length === 0) {
//             return res.status(404).json({ error: 'No chat rooms found for the user' });
//         }

//         const formattedRooms = rooms.map(room => ({
//             id: room.id,
//             user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
//             user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
//         }));

//         console.log('Chat rooms for user:', formattedRooms);
//         res.json(formattedRooms);
//     } catch (err) {
//         console.error('Error while fetching chat rooms for user:', err);
//         res.status(500).json({ error: 'Error while fetching chat rooms' });
//     }
// });

// router.get('/:roomId', async (req, res) => {
//     const { roomId } = req.params;

//     try {
//         const messages = await Message.findAll({ where: { roomId } });
//         if (messages.length === 0) {
//             return res.status(404).json({ error: 'No messages found in this room' });
//         }
//         res.json(messages);
//     } catch (err) {
//         console.error('Error fetching messages:', err);
//         res.status(500).json({ error: 'Server error while fetching messages' });
//     }
// });

// let onlineUsers = {};  

// function socketSetup(io) {
//     io.on('connection', (socket) => {
//         console.log('User connected to WebSocket', socket.id);
//         console.log(socket.handshake);
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
//             console.log("USERAUTH", socket.user.id)
//             onlineUsers[socket.user.id] = socket.user.username;
//             console.log('Current online users:', onlineUsers);
//             console.log(Object.keys(onlineUsers).map(userId => ({
//                 userId,
//                 username: socket.user.username 
//               })))

//         io.emit('userOnline', onlineUsers)

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

//             // Usuń użytkownika z listy online
//             if (socket.user && onlineUsers[socket.user.id]) {
//                 delete onlineUsers[socket.user.id];
//                 console.log('Current online users:', onlineUsers);

//                 // Emituj zdarzenie, że użytkownik jest offline
//                 io.emit('userOffline', { userId: socket.user.id });
//             }
//         });
//     });
// }


// // const mqtt = require('mqtt');

// // const mqttClient = mqtt.connect('mqtt://localhost:1883');

// // mqttClient.on('connect', () => {
// //     console.log('Connected to MQTT broker');
// //     mqttClient.subscribe(['chat/+']);
// // });

// // mqttClient.on('message', async (topic, message) => {
// //     try {
// //         const messageData = JSON.parse(message.toString());
// //         const topicParts = topic.split('/');
// //         const action = topicParts[1];

// //         switch (action) {
// //             case 'start':
// //                 await handleStartChat(messageData);
// //                 break;
// //             case 'message':
// //                 await handleSendMessage(messageData); // Przetwarzanie wiadomości i zapis do bazy
// //                 break;
// //             case 'join':
// //                 await handleJoinRoom(messageData);
// //                 break;
// //         }
// //     } catch (error) {
// //         console.error('Error handling MQTT message:', error);
// //     }
// // });


// // const verifyToken = (token) => {
// //     try {
// //         return jwt.verify(token, process.env.JWT_SECRET);
// //     } catch (error) {
// //         console.error('Token verification error:', error);
// //         return null;
// //     }
// // };
// // const handleStartChat = async (data) => {
// //     const { token, recipientId } = data;
// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //         console.error('Invalid or expired token');
// //         return;
// //     }

// //     try {
// //         const recipient = await User.findByPk(recipientId);
// //         if (!recipient) {
// //             console.error('Recipient not found');
// //             return;
// //         }

// //         const [room] = await Room.findOrCreate({
// //             where: {
// //                 [Op.or]: [
// //                     { user1Id: decoded.id, user2Id: recipientId },
// //                     { user1Id: recipientId, user2Id: decoded.id },
// //                 ],
// //             },
// //             defaults: {
// //                 user1Id: decoded.id,
// //                 user2Id: recipientId,
// //             },
// //         });

// //         mqttClient.publish(`chat/start/response/${decoded.id}`, JSON.stringify({ roomId: room.id, message: 'Chat started successfully' }));
// //     } catch (err) {
// //         console.error('Error during chat start:', err);
// //     }
// // };

// // // Obsługuje wysyłanie wiadomości
// // const handleSendMessage = async (data) => {
// //     const { token, roomId, content } = data;
// //     console.log("DANE", data)
// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //         console.error('Invalid or expired token');
// //         return;
// //     }

// //     try {
// //         // Sprawdzenie nadawcy wiadomości
// //         const sender = await User.findOne({
// //             where: { id: decoded.id },
// //             attributes: ['id', 'username'],
// //         });

// //         if (!sender) {
// //             console.error('Sender not found');
// //             return;
// //         }

// //         // Zapisanie wiadomości do bazy danych
// //         const message = await Message.create({
// //             roomId,
// //             content,
// //             userId: sender.id,
// //             timestamp: new Date(),
// //         });

// //         console.log('Message created:', message);

// //         // Utworzenie nowej wiadomości, którą wyślemy przez MQTT
// //         const newMessage = {
// //             id: message.id,
// //             content: message.content,
// //             timestamp: message.timestamp,
// //             roomId: message.roomId,
// //             senderUsername: sender.username,
// //         };

// //         // Publikowanie wiadomości do odpowiedniego tematu MQTT
// //         mqttClient.publish(`chat/message/${roomId}`, JSON.stringify(newMessage));
// //     } catch (err) {
// //         console.error('Error sending message via MQTT:', err);
// //     }
// // };

// // // Obsługuje dołączanie do pokoju
// // const handleJoinRoom = async (data) => {
// //     const { token, roomId } = data;
// //     const decoded = verifyToken(token);
// //     if (!decoded) {
// //         console.error('Invalid or expired token');
// //         return;
// //     }

// //     try {
// //         const room = await Room.findOne({
// //             where: { id: roomId },
// //             include: [
// //                 { model: User, as: 'User1', attributes: ['id', 'username'] },
// //                 { model: User, as: 'User2', attributes: ['id', 'username'] },
// //             ],
// //         });

// //         const roomInfo = {
// //             user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
// //             user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
// //         };

// //         const messages = await Message.findAll({
// //             where: { roomId },
// //             include: [
// //                 {
// //                     model: User,
// //                     attributes: ['id', 'username'],
// //                 },
// //             ],
// //             order: [['timestamp', 'ASC']],
// //         });

// //         const formattedMessages = messages.map(message => ({
// //             id: message.id,
// //             content: message.content,
// //             timestamp: message.timestamp,
// //             roomId: message.roomId,
// //             senderUsername: message.User ? message.User.username : 'Nieznany użytkownik',
// //         }));

// //         mqttClient.publish(`chat/join/response/${decoded.id}`, JSON.stringify({ roomInfo, messages: formattedMessages }));
// //     } catch (err) {
// //         console.error('Error joining room:', err);
// //     }
// // };
// const mqtt = require('mqtt');

// const mqttClient = mqtt.connect('mqtt://localhost:1883');

// // ✅ Sprawdzenie czy połączenie MQTT działa poprawnie
// mqttClient.on('connect', () => {
//     console.log('✅ Connected to MQTT broker');
//     mqttClient.subscribe(['chat/message/#', 'chat/start/#', 'chat/join/#'], (err) => {
//         if (err) {
//             console.error('❌ Subscription error:', err);
//         } else {
//             console.log('✅ Successfully subscribed to chat topics');
//         }
//     });
// });

// // ✅ Obsługa błędów MQTT
// mqttClient.on('error', (err) => {
//     console.error('❌ MQTT client error:', err);
// });

// // ✅ Middleware do uwierzytelniania użytkownika na podstawie tokena
// // ✅ Middleware do uwierzytelniania użytkownika na podstawie tokena
// const authenticateMiddleware = (callback) => async (topic, message) => {
//     console.log(`📩 Received MQTT message on topic: ${topic}`);
//     try {
//         const messageData = JSON.parse(message.toString());
//         console.log("Message data:", messageData);

//         const token = messageData.token;
//         if (!token) {
//             console.error('❌ Brak tokena w wiadomości MQTT');
//             return;
//         }

//         // Weryfikacja tokena
//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             console.log('✅ Token zweryfikowany:', decoded);
//             messageData.user = decoded; // Dodajemy usera do danych
//             await callback(messageData); // Wywołujemy funkcję callback
//         } catch (error) {
//             console.error('❌ Błąd weryfikacji tokena:', error);
//         }
//     } catch (error) {
//         console.error('❌ Błąd parsowania wiadomości MQTT:', error);
//     }
// };

// // ✅ Obsługa wiadomości MQTT
// mqttClient.on('message', async (topic, message) => {
//     console.log("📩 Raw MQTT message:", message.toString());

//     const topicParts = topic.split('/');
//     const action = topicParts[1];

//     // Zaktualizuj metodę callback dla każdego przypadku
//     switch (action) {
//         case 'start':
//             authenticateMiddleware(handleStartChat)(topic, message);
//             break;
//         case 'message':
//             authenticateMiddleware(handleSendMessage)(topic, message);
//             break;
//         case 'join':
//             authenticateMiddleware(handleJoinRoom)(topic, message);
//             break;
//         default:
//             console.warn('⚠️ Unknown MQTT topic:', topic);
//     }
// });

// // ✅ Obsługa rozpoczęcia czatu
// const handleStartChat = async (data) => {
//     const { user, recipientId } = data;

//     try {
//         const recipient = await User.findByPk(recipientId);
//         if (!recipient) return console.error('❌ Recipient not found');

//         const [room] = await Room.findOrCreate({
//             where: {
//                 [Op.or]: [
//                     { user1Id: user.id, user2Id: recipientId },
//                     { user1Id: recipientId, user2Id: user.id },
//                 ],
//             },
//             defaults: { user1Id: user.id, user2Id: recipientId },
//         });

//         const responseTopic = `chat/start/response/${user.id}`;
//         mqttClient.publish(responseTopic, JSON.stringify({ roomId: room.id, message: 'Chat started successfully' }));
//         console.log(`✅ Published to ${responseTopic}:`, { roomId: room.id });

//     } catch (err) {
//         console.error('❌ Error during chat start:', err);
//     }
// };

// // ✅ Obsługa wysyłania wiadomości
// const handleSendMessage = async (data) => {
//     const { user, roomId, content } = data;
//     console.log("📨 Received message data:", data);

//     try {
//         const sender = await User.findOne({ where: { id: user.id }, attributes: ['id', 'username'] });
//         if (!sender) return console.error('❌ Sender not found');

//         const message = await Message.create({
//             roomId,
//             content,
//             userId: sender.id,
//             timestamp: new Date(),
//         });

//         console.log('✅ Message created:', message);

//         const newMessage = {
//             id: message.id,
//             content: message.content,
//             timestamp: message.timestamp,
//             roomId: message.roomId,
//             senderUsername: sender.username,
//         };

//         const messageTopic = `chat/message/${roomId}`;
//         mqttClient.publish(messageTopic, JSON.stringify(newMessage));
//         console.log(`✅ Published message to ${messageTopic}:`, newMessage);

//     } catch (err) {
//         console.error('❌ Error sending message via MQTT:', err);
//     }
// };

// // ✅ Obsługa dołączania do pokoju
// const handleJoinRoom = async (data) => {
//     const { user, roomId } = data;

//     try {
//         const room = await Room.findOne({
//             where: { id: roomId },
//             include: [
//                 { model: User, as: 'User1', attributes: ['id', 'username'] },
//                 { model: User, as: 'User2', attributes: ['id', 'username'] },
//             ],
//         });

//         if (!room) return console.error('❌ Room not found');

//         const roomInfo = {
//             user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
//             user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
//         };

//         const messages = await Message.findAll({
//             where: { roomId },
//             include: [{ model: User, attributes: ['id', 'username'] }],
//             order: [['timestamp', 'ASC']],
//         });

//         const formattedMessages = messages.map(message => ({
//             id: message.id,
//             content: message.content,
//             timestamp: message.timestamp,
//             roomId: message.roomId,
//             senderUsername: message.User ? message.User.username : 'Nieznany użytkownik',
//         }));

//         const responseTopic = `chat/join/response/${user.id}`;
//         mqttClient.publish(responseTopic, JSON.stringify({ roomInfo, messages: formattedMessages }));
//         console.log(`✅ Published to ${responseTopic}:`, { roomInfo, messages: formattedMessages });

//     } catch (err) {
//         console.error('❌ Error joining room:', err);
//     }
// };


// function socketSetup(io) {
//     io.on('connection', (socket) => {
//         const token = socket.handshake.auth.token;

//         if (!token) {
//             socket.disconnect();
//             return;
//         }

//         const decoded = authenticateMiddleware(token);
//         if (decoded) {
//             socket.user = decoded;
//             onlineUsers[socket.user.id] = socket.user.username;
//             io.emit('userOnline', onlineUsers);
//         } else {
//             socket.disconnect();
//             return;
//         }

//         socket.on('joinRoom', async ({ roomId }) => {
//             socket.join(roomId);

//             const messages = await Message.findAll({
//                 where: { roomId },
//                 include: [
//                     {
//                         model: User,
//                         attributes: ['id', 'username'],
//                     },
//                 ],
//                 order: [['timestamp', 'ASC']],
//             });

//             const formattedMessages = messages.map(message => ({
//                 id: message.id,
//                 content: message.content,
//                 timestamp: message.timestamp,
//                 roomId: message.roomId,
//                 senderUsername: message.User?.username || 'Nieznany użytkownik',
//             }));
//             socket.emit('loadMessages', formattedMessages);
//         });

//         socket.on('sendMessage', async (messageData) => {
//             try {
//                 const sender = await User.findOne({
//                     where: { id: socket.user.id },
//                     attributes: ['id', 'username'],
//                 });

//                 const message = await Message.create({
//                     roomId: messageData.roomId,
//                     content: messageData.content,
//                     userId: sender.id,
//                     timestamp: new Date(),
//                 });

//                 const newMessage = {
//                     id: message.id,
//                     content: message.content,
//                     timestamp: message.timestamp,
//                     roomId: message.roomId,
//                     senderUsername: sender.username,
//                 };

//                 io.to(messageData.roomId).emit('newMessage', newMessage);
//                 mqttClient.publish(`chat/message/${messageData.roomId}`, JSON.stringify(newMessage));
//             } catch (err) {
//                 console.error('Error sending message via WebSocket:', err);
//             }
//         });

//         socket.on('disconnect', () => {
//             if (socket.user && onlineUsers[socket.user.id]) {
//                 delete onlineUsers[socket.user.id];
//                 io.emit('userOffline', { userId: socket.user.id });
//             }
//         });
//     });
// }

// module.exports = { router, socketSetup };


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


// const mqtt = require('mqtt');

// const mqttClient = mqtt.connect('mqtt://localhost:1883');

// mqttClient.on('connect', () => {
//     console.log('Connected to MQTT broker');
//     mqttClient.subscribe(['chat/+']);
// });

// mqttClient.on('message', async (topic, message) => {
//     try {
//         const messageData = JSON.parse(message.toString());
//         const topicParts = topic.split('/');
//         const action = topicParts[1];

//         switch (action) {
//             case 'start':
//                 await handleStartChat(messageData);
//                 break;
//             case 'message':
//                 await handleSendMessage(messageData); // Przetwarzanie wiadomości i zapis do bazy
//                 break;
//             case 'join':
//                 await handleJoinRoom(messageData);
//                 break;
//         }
//     } catch (error) {
//         console.error('Error handling MQTT message:', error);
//     }
// });


// const verifyToken = (token) => {
//     try {
//         return jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//         console.error('Token verification error:', error);
//         return null;
//     }
// };
// const handleStartChat = async (data) => {
//     const { token, recipientId } = data;
//     const decoded = verifyToken(token);
//     if (!decoded) {
//         console.error('Invalid or expired token');
//         return;
//     }

//     try {
//         const recipient = await User.findByPk(recipientId);
//         if (!recipient) {
//             console.error('Recipient not found');
//             return;
//         }

//         const [room] = await Room.findOrCreate({
//             where: {
//                 [Op.or]: [
//                     { user1Id: decoded.id, user2Id: recipientId },
//                     { user1Id: recipientId, user2Id: decoded.id },
//                 ],
//             },
//             defaults: {
//                 user1Id: decoded.id,
//                 user2Id: recipientId,
//             },
//         });

//         mqttClient.publish(`chat/start/response/${decoded.id}`, JSON.stringify({ roomId: room.id, message: 'Chat started successfully' }));
//     } catch (err) {
//         console.error('Error during chat start:', err);
//     }
// };

// // Obsługuje wysyłanie wiadomości
// const handleSendMessage = async (data) => {
//     const { token, roomId, content } = data;
//     console.log("DANE", data)
//     const decoded = verifyToken(token);
//     if (!decoded) {
//         console.error('Invalid or expired token');
//         return;
//     }

//     try {
//         // Sprawdzenie nadawcy wiadomości
//         const sender = await User.findOne({
//             where: { id: decoded.id },
//             attributes: ['id', 'username'],
//         });

//         if (!sender) {
//             console.error('Sender not found');
//             return;
//         }

//         // Zapisanie wiadomości do bazy danych
//         const message = await Message.create({
//             roomId,
//             content,
//             userId: sender.id,
//             timestamp: new Date(),
//         });

//         console.log('Message created:', message);

//         // Utworzenie nowej wiadomości, którą wyślemy przez MQTT
//         const newMessage = {
//             id: message.id,
//             content: message.content,
//             timestamp: message.timestamp,
//             roomId: message.roomId,
//             senderUsername: sender.username,
//         };

//         // Publikowanie wiadomości do odpowiedniego tematu MQTT
//         mqttClient.publish(`chat/message/${roomId}`, JSON.stringify(newMessage));
//     } catch (err) {
//         console.error('Error sending message via MQTT:', err);
//     }
// };

// // Obsługuje dołączanie do pokoju
// const handleJoinRoom = async (data) => {
//     const { token, roomId } = data;
//     const decoded = verifyToken(token);
//     if (!decoded) {
//         console.error('Invalid or expired token');
//         return;
//     }

//     try {
//         const room = await Room.findOne({
//             where: { id: roomId },
//             include: [
//                 { model: User, as: 'User1', attributes: ['id', 'username'] },
//                 { model: User, as: 'User2', attributes: ['id', 'username'] },
//             ],
//         });

//         const roomInfo = {
//             user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
//             user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
//         };

//         const messages = await Message.findAll({
//             where: { roomId },
//             include: [
//                 {
//                     model: User,
//                     attributes: ['id', 'username'],
//                 },
//             ],
//             order: [['timestamp', 'ASC']],
//         });

//         const formattedMessages = messages.map(message => ({
//             id: message.id,
//             content: message.content,
//             timestamp: message.timestamp,
//             roomId: message.roomId,
//             senderUsername: message.User ? message.User.username : 'Nieznany użytkownik',
//         }));

//         mqttClient.publish(`chat/join/response/${decoded.id}`, JSON.stringify({ roomInfo, messages: formattedMessages }));
//     } catch (err) {
//         console.error('Error joining room:', err);
//     }
// };


const mqtt = require('mqtt');

const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(['chat/message/#', 'chat/start/#', 'chat/join/#'], (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log('Successfully subscribed to chat topics');
        }
    });
});

mqttClient.on('error', (err) => {
    console.error('MQTT client error:', err);
});

const authenticateMiddleware = (callback) => async (topic, message) => {
    console.log(`Received MQTT message on topic: ${topic}, ${message}`);
    try {
        const messageData = JSON.parse(message.toString());
        console.log("Message data:", messageData);

        const token = messageData.token;
        if (!token) {
            console.error('Brak tokena w wiadomości MQTT');
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token zweryfikowany:', decoded);
            messageData.user = decoded; 
            await callback(messageData);
        } catch (error) {
            console.error('Błąd weryfikacji tokena:', error);
        }
    } catch (error) {
        console.error('Błąd parsowania wiadomości MQTT:', error);
    }
};

mqttClient.on('message', async (topic, message) => {
    console.log("Raw MQTT message:", message.toString());

    const topicParts = topic.split('/');
    const action = topicParts[1];

    switch (action) {
        case 'start':
            authenticateMiddleware(handleStartChat)(topic, message);
            break;
        case 'message':
            authenticateMiddleware(handleSendMessage)(topic, message);
            break;
        case 'join':
            authenticateMiddleware(handleJoinRoom)(topic, message);
            break;
        default:
            console.warn('⚠️ Unknown MQTT topic:', topic);
    }
});

const handleStartChat = async (data) => {
    const { user, recipientId } = data;

    try {
        const recipient = await User.findByPk(recipientId);
        if (!recipient) return console.error('Recipient not found');

        const [room] = await Room.findOrCreate({
            where: {
                [Op.or]: [
                    { user1Id: user.id, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: user.id },
                ],
            },
            defaults: { user1Id: user.id, user2Id: recipientId },
        });

        const responseTopic = `chat/start/response/${user.id}`;
        mqttClient.publish(responseTopic, JSON.stringify({ roomId: room.id, message: 'Chat started successfully' }));
        console.log(`Published to ${responseTopic}:`, { roomId: room.id });

    } catch (err) {
        console.error('Error during chat start:', err);
    }
};

const handleSendMessage = async (data) => {
    const { user, roomId, content } = data;
    console.log("Received message data:", data);

    try {
        const sender = await User.findOne({ where: { id: user.id }, attributes: ['id', 'username'] });
        if (!sender) return console.error('Sender not found');

        const message = await Message.create({
            roomId,
            content,
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
            token: message.token,
        };

        const messageTopic = `chat/message/${roomId}`;
        mqttClient.publish(messageTopic, JSON.stringify(newMessage));
        console.log(`Published message to ${messageTopic}:`, newMessage);

    } catch (err) {
        console.error('Error sending message via MQTT:', err);
    }
};

const handleJoinRoom = async (data) => {
    const { user, roomId } = data;

    try {
        const room = await Room.findOne({
            where: { id: roomId },
            include: [
                { model: User, as: 'User1', attributes: ['id', 'username'] },
                { model: User, as: 'User2', attributes: ['id', 'username'] },
            ],
        });

        if (!room) return console.error('Room not found');

        const roomInfo = {
            user1: room.User1 ? room.User1.username : 'Nieznany użytkownik',
            user2: room.User2 ? room.User2.username : 'Nieznany użytkownik',
        };

        const messages = await Message.findAll({
            where: { roomId },
            include: [{ model: User, attributes: ['id', 'username'] }],
            order: [['timestamp', 'ASC']],
        });

        const formattedMessages = messages.map(message => ({
            id: message.id,
            content: message.content,
            timestamp: message.timestamp,
            roomId: message.roomId,
            senderUsername: message.User ? message.User.username : 'Nieznany użytkownik',
            token: message.token
        }));

        const responseTopic = `chat/join/response/${user.id}`;
        mqttClient.publish(responseTopic, JSON.stringify({ roomInfo, messages: formattedMessages }));
        console.log(`Published to ${responseTopic}:`, { roomInfo, messages: formattedMessages });

    } catch (err) {
        console.error('Error joining room:', err);
    }
};



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

            if (socket.user && onlineUsers[socket.user.id]) {
                delete onlineUsers[socket.user.id];
                console.log('Current online users:', onlineUsers);

                io.emit('userOffline', { userId: socket.user.id });
            }
        });
    });
}

module.exports = {
    router,
    socketSetup,
};
