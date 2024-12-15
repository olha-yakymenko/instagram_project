
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