

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./models/index');
const authRoutes = require('./routes/auth');

const app = express();

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

