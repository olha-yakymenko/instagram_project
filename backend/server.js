const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/index');
const authRoutes = require('./routes/auth');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const { router: messageRoutes, socketSetup } = require('./routes/messages');

const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3002',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const allowedOrigins = ['http://localhost:3002']; 
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes); 

connectDB();

const { sequelize } = require('./models/index');
sequelize.sync().then(() => {
  console.log('Database synchronized');
});

socketSetup(io);

const PORT = process.env.PORT || 5007;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
