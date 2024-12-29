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

router.post('/subscribe', authenticate, async (req, res) => {
    const { followingUsername } = req.body; 
    const followerId = req.user.id;
  
    if (req.user.username === followingUsername) {
      return res.status(400).json({ error: 'Nie możesz subskrybować samego siebie' });
    }
  
    try {
      const followingUser = await User.findOne({ where: { username: followingUsername } });
      
      if (!followingUser) {
        return res.status(404).json({ error: 'Użytkownik, którego próbujesz subskrybować, nie istnieje' });
      }
  
      const followingId = followingUser.id; 
  
      const existingSubscription = await Follower.findOne({
        where: { followerId, followingId }
      });
  
      if (existingSubscription) {
        return res.status(400).json({ error: 'Już subskrybujesz tego użytkownika' });
      }
      const subscription = await Follower.create({ followerId, followingId });
  
      await Notification.create({
        userId: followingId, 
        relatedUserId: followerId, 
        type: 'subscription', 
        content: `${req.user.username} zaczął Cię obserwować!`, 
      });
  
      client.publish(`user/${followingId}/notifications`, JSON.stringify({
        userId: followingId,
        relatedUserId: followerId,
        action: 'new_notification',
        type: 'subscription',
        contentText: `${req.user.username} zaczął Cię obserwować!`,
      }), (err) => {
        if (err) {
          console.error(`Błąd publikacji powiadomienia dla użytkownika ${followingId}:`, err);
        } else {
          console.log(`Powiadomienie opublikowane dla użytkownika ${followingId}: Zaczął Cię obserwować!`);
        }
      });
      
      client.publish(`user/${followerId}/notifications`, JSON.stringify({
        userId: followerId,
        relatedUserId: followingId,
        action: 'new_notification',
        type: 'subscription',
        contentText: `${req.user.username} zacząłeś go obserwować!`,
      }), (err) => {
        if (err) {
          console.error(`Błąd publikacji powiadomienia dla użytkownika ${followerId}:`, err);
        } else {
          console.log(`Powiadomienie opublikowane dla użytkownika ${followerId}: Zacząłeś go obserwować!`);
        }
      });
      
  
      return res.status(201).json(subscription);
    } catch (error) {
      console.error('Błąd podczas subskrypcji:', error.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  });

module.exports = router;


