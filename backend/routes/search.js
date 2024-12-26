const express = require('express');
const { Op } = require('sequelize'); 
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Like = require('../models/like');

router.get('/', async (req, res) => {
    try {
        const username = req.query.username; 
        if (!username) {
            return res.status(400).json({ error: 'Brak nazwy użytkownika w zapytaniu' });
        }

        console.log(`Szukam użytkownika: ${username}`); 

        const users = await User.findAll({
            where: { username: { [Op.like]: `%${username}%` } },
            collate: 'utf8_general_ci', 
        });

        console.log(`Znaleziono użytkowników: ${users.length}`); 

        if (users.length === 0) {
            return res.status(404).json({ error: `Brak użytkownika o nazwie ${username}` });
        }
        const userPosts = await Promise.all(users.map(async (user) => {
            const posts = await Post.findAll({
                where: { authorId: user.id },
                include: [
                    {
                        model: Comment,
                        include: {
                            model: User,
                            attributes: ['username'], 
                        },
                    },
                    {
                        model: Like,
                        include: {
                            model: User,
                            attributes: ['username'], 
                        },
                    },
                    {
                        model: User,
                        attributes: ['username'], 
                    },
                ],
            });
            return { user: user.username, posts };
        }));

        console.log(`Zwracane posty: ${JSON.stringify(userPosts)}`);  
        res.json(userPosts);
    } catch (error) {
        console.error('Błąd:', error);
        res.status(400).json({ error: error.message });
    }
});



module.exports = router;
