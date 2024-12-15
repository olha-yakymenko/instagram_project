const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/index');
const authRoutes = require('./routes/auth');

const app = express();

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

  
app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);


require('dotenv').config(); 

connectDB();

const { sequelize } = require('./models/index');

sequelize.sync().then(() => {
    console.log('Database synchronized');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

