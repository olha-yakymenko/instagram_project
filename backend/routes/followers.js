const mqtt = require('mqtt');
const express = require('express');
const User = require('../models/user');
const Follower = require('../models/follower');
const Notification=require('../models/notification')
const router = express.Router();
const jwt = require('jsonwebtoken');

const client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', () => {
  console.log('Połączono z brokerem MQTT');
});

client.on('error', (err) => {
  console.error('Błąd MQTT:', err);
});

const authenticate = (req, res, next) => {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w ciasteczkach' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token zweryfikowany:', decoded);
    next();
  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    return res.status(401).json({ error: 'Niepoprawny lub wygasły token' });
  }
};

module.exports = router;


