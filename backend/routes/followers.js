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
    const username = req.headers['x-username'];

    console.log('Received username:', username);

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    const token = req.cookies[`auth_token_${username}`];

    console.log('Received token from cookies:', token);

    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego w ciasteczkach' });
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

router.delete('/unsubscribe/:followerId/:followingUsername', async (req, res) => {
const { followerId, followingUsername } = req.params;
try {
    const followingUser = await User.findOne({ where: { username: followingUsername } });

    if (!followingUser) {
    return res.status(404).json({ error: 'Użytkownik nie istnieje' });
    }

    const followingId = followingUser.id; 

    const subscription = await Follower.findOne({
    where: { followerId, followingId },
    });

    if (!subscription) {
    return res.status(404).json({ error: 'Nie znaleziono subskrypcji' });
    }

    await subscription.destroy();

    client.publish(`user/${followingId}/subscribers`, JSON.stringify({
    userId: followingId,
    relatedUserId: followerId,
    action: 'unsubscribe',
    followerId,
    followingId,
    contentText: `${followingUsername} nie subskrybujesz!`
    }));

    return res.status(200).json({ message: 'Subskrypcja usunięta' });
} catch (error) {
    console.error('Błąd podczas usuwania subskrypcji:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
}
});

router.delete('/unsubscribe1/:followerId/:followingId', async (req, res) => {
  const { followerId, followingId } = req.params;

  try {
    const subscription = await Follower.findOne({
      where: { followerId, followingId },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Nie znaleziono subskrypcji' });
    }

    await subscription.destroy();

    client.publish(`user/${followingId}/subscribers`, JSON.stringify({
      userId: followingId,
      relatedUserId: followerId,
      action: 'unsubscribe',
      followerId,
      followingId,
      contentText: `Subskrybcja anulowana!`
    }));

    return res.status(200).json({ message: 'Subskrypcja usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania subskrypcji:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
});


router.get('/:userId/followers', async (req, res) => {
const { userId } = req.params;

try {
    const followers = await Follower.findAll({
    where: { followingId: userId },
    include: { model: User, as: 'follower', attributes: ['id', 'username'] },
    });

    return res.status(200).json(followers.map(f => f.follower));
} catch (error) {
    console.error('Błąd podczas pobierania subskrybentów:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
}
});

router.get('/:userId/following', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const following = await Follower.findAll({
        where: { followerId: userId },
        include: { model: User, as: 'following', attributes: ['id', 'username'] },
      });
  
      return res.status(200).json(following.map(f => f.following));
    } catch (error) {
      console.error('Błąd podczas pobierania subskrybowanych użytkowników:', error);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  });

  router.get('/:userId/followers', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const followers = await Follower.findAll({
        where: { followingId: userId },
        include: { model: User, as: 'follower', attributes: ['id', 'name'] },
      });
  
      return res.status(200).json(followers.map(f => f.follower));
    } catch (error) {
      console.error('Błąd podczas pobierania subskrybentów:', error);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  });

  router.get('/:userId/following', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const following = await Follower.findAll({
        where: { followerId: userId },
        include: { model: User, as: 'following', attributes: ['id', 'name'] },
      });
  
      return res.status(200).json(following.map(f => f.following));
    } catch (error) {
      console.error('Błąd podczas pobierania subskrybowanych użytkowników:', error);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
  });
  

router.get('/:username/count', async (req, res) => {
const { username } = req.params;

try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
    return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    const userId = user.id;

    const followersCount = await Follower.count({ where: { followingId: userId } }) || 0;
    const followingCount = await Follower.count({ where: { followerId: userId } }) || 0;

    return res.status(200).json({ followersCount, followingCount });
} catch (error) {
    console.error('Błąd podczas liczenia subskrypcji:', error.message);
    return res.status(500).json({ error: 'Błąd serwera' });
}
});


router.get('/subscriptions/:userId/:name', async (req, res) => {
    const { userId, name } = req.params;
  
    try {
      const followingUser = await User.findOne({ where: { username: name } });
  
      if (!followingUser) {
        return res.status(404).json({ error: 'Użytkownik, którego szukasz, nie istnieje' });
      }
  
      const subscription = await Follower.findOne({
        where: { followerId: userId, followingId: followingUser.id },
      });
  
      res.status(200).json({ isSubscribed: !!subscription });
    } catch (error) {
      console.error('Błąd podczas sprawdzania subskrypcji:', error);
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });
  

module.exports = router;


