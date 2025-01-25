const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/index');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');
const adsRoutes=require('./routes/ads')
const notificationRoutes = require('./routes/notifications');
const followerRoute=require('./routes/followers')
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const privateKey = fs.readFileSync('/home/olha/studia2/psw/git_projekt/instagram_project/localhost.key', 'utf8');
const certificate = fs.readFileSync('/home/olha/studia2/psw/git_projekt/instagram_project/localhost.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const { router: messageRoutes, socketSetup } = require('./routes/messages');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/ads', express.static(path.join(__dirname, 'ads')));

const server = https.createServer(credentials, app);

const io = socketIo(server, {
  cors: {
    origin: ['https://localhost', 'http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


const allowedOrigins = ['https://localhost', 'http://localhost:3001','http://localhost:3000']; 
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
app.use('/api/posts', postRoutes);
app.use('/api/ads', adsRoutes)
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/followers', followerRoute)


connectDB();

const { sequelize } = require('./models/index');
sequelize.sync().then(() => {
  console.log('Database synchronized');
});

socketSetup(io);

const PORT = process.env.PORT || 5007;

server.listen(PORT, () => {
  console.log('Backend działa na https://localhost:5007');
});
