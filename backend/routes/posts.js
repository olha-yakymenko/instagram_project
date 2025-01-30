const express = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Like = require('../models/like');
const Notification = require('../models/notification')
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt'); 
const cookieParser = require('cookie-parser');  
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();
router.use(cookieParser()); 

const mqttClient = mqtt.connect('mqtt://localhost:1883');
mqttClient.on('connect', () => {
    console.log('MQTT client connected');
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


  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); 
  }
  
  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
          cb(null, 'uploads/'); 
      },
      filename: function (req, file, cb) {
          const timestamp = Date.now();
          const originalName = path.parse(file.originalname).name; 
          const extension = path.extname(file.originalname); 
          const newName = `${timestamp}-${originalName}${extension}`;
          cb(null, newName);  
      }
  });
  const upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
          if (allowedTypes.includes(file.mimetype)) {
              cb(null, true);
          } else {
              cb(new Error('Nieprawidłowy typ pliku. Dozwolone są: JPEG, PNG, GIF.'));
          }
      },
  });
  
  router.use('/uploads', express.static(uploadDir));
  
  
router.post('/', authenticate, upload.single('image'), async (req, res) => {
    const { description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Zdjęcie jest wymagane' });
    }

    try {
        const imagePath = `/uploads/${file.filename}`;
        
        const post = await Post.create({
            image: imagePath,  
            description,
            authorId: req.user.id,
        });
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                as: 'User',
                attributes: ['id', 'username'],
            },
        });

        const postsWithImageUrls = posts.map(post => {
            return {
                ...post.dataValues,
                image: `https://localhost:5007${post.image}`, 
            };
        });

        res.json(postsWithImageUrls);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    try {
        const post = await Post.findByPk(id);
        if (!post || post.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Brak dostępu' });
        }

        post.description = description || post.description;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findByPk(id);
        if (!post || post.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Brak dostępu' });
        }

        const imagePath = Buffer.isBuffer(post.image)
            ? post.image.toString('utf-8') 
            : post.image;

        console.log('Ścieżka obrazu:', imagePath);

        if (typeof imagePath !== 'string') {
            throw new Error('Niepoprawny format pola "image" w poście');
        }

        const imageRelativePath = imagePath.startsWith('/')
            ? imagePath.slice(1) 
            : imagePath;
        const filePath = path.join(__dirname, '..', imageRelativePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await post.destroy();

        mqttClient.publish('posts/deleted', JSON.stringify({ id }));

        res.json({ message: 'Post usunięty' });
    } catch (error) {
        console.error('Błąd podczas usuwania posta:', error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/:username', async (req, res) => {
    const { username } = req.params; 
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const posts = await Post.findAll({
            where: { authorId: user.id },
            include: {
                model: User,
                as: 'User',
                attributes: ['id', 'username'], 
            },
        });

        const postsWithImageUrls = posts.map(post => {
            return {
                ...post.dataValues,
                image: `https://localhost:5007${post.image}`,  
            };
        });

        res.json(postsWithImageUrls);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    try {
        const comments = await Comment.findAll({
            where: { postId },
            include: {
                model: User,
                attributes: ['username'],
            },
        });
        res.json(comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/user/:userId/liked-posts', authenticate, async (req, res) => {
    const { userId } = req.params;

    try {
        const likes = await Like.findAll({
            where: { userId },
            include: [
                {
                    model: Post,
                    include: [
                        {
                            model: User,
                            attributes: ['username'],
                        }
                    ]
                }
            ]
        });

        if (!likes.length) {
            return res.status(404).json({ error: 'Brak polubionych postow dla tego uzytkownika' });
        }

        const likedPosts = likes.map(like => like.Post);

        res.json(likedPosts);
    } catch (error) {
        console.error('Blad podczas pobierania polubien:', error);
        res.status(500).json({ error: 'Blad z polubieniami' });
    }
});

router.get('/:id/likes', async (req, res) => {
    const { id } = req.params;
    try {
        const likeCount = await Like.count({ where: { postId: id } });
        res.json({ likes: likeCount });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/:id/likes', authenticate, async (req, res) => {
    const { id } = req.params;
    console.log("User ID:", req.user ? req.user.id : "User ID is undefined");

    try {
        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        console.log("Postaaa:", post);

        const [like, created] = await Like.findOrCreate({
            where: { userId: req.user.id, postId: post.id },
        });

        const likeCount = await Like.count({ where: { postId: post.id } });

        mqttClient.publish(
            `posts/${post.id}/likes`,
            JSON.stringify({ likes: likeCount }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for likes:', err);
                } else {
                    console.log('Published like count successfully');
                }
            }
        );

        const notificationMessage = `${req.user.username} polubił twój post.`;

        await Notification.create({
            userId: post.authorId,        
            relatedUserId: req.user.id,    
            postId: post.id,               
            type: 'like',                  
            content: notificationMessage, 
        });

        mqttClient.publish(
            `user/${post.authorId}/notifications`, 
            JSON.stringify({
                postId: post.id,
                type: 'like',
                contentText: notificationMessage,
            }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for like notification:', err);
                } else {
                    console.log('Published like notification successfully');
                }
            }
        );

        res.status(201).json({ likes: likeCount });
    } catch (error) {
        console.error('Error in /likes route:', error);
        res.status(400).json({ error: error.message });
    }
});



router.post('/:postId/comments', authenticate, async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    try {
        const post = await Post.findByPk(postId); 

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await Comment.create({
            content,
            postId,
            authorId: req.user.id,
        });

        const notificationPayloadForPostAuthor = {
            userId: post.authorId, 
            relatedUserId: req.user.id, 
            postId: post.id,
            type: 'comment',
            content: `${req.user.username} dodał nowy komentarz: "${comment.content}"`,
        };


        mqttClient.publish(
            `user/${post.authorId}/notifications`,  
            JSON.stringify({
                postId: postId,
                type: 'comment',
                contentText: `Twój post otrzymał nowy komentarz: "${comment.content}"`,
            }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for comment notification to post author:', err);
                } else {
                    console.log('Published comment notification to post author successfully');
                }
            }
        );

        await Notification.create(notificationPayloadForPostAuthor);


        const notificationPayloadForCommenter = {
            userId: req.user.id, 
            relatedUserId: post.authorId, 
            postId: post.id,
            type: 'comment',
            content: `Dodałeś nowy komentarz: "${comment.content}"`,
        };


        mqttClient.publish(
            `user/${req.user.id}/notifications`,  
            JSON.stringify({
                postId: postId,
                type: 'comment',
                contentText: `Dodałeś nowy komentarz: "${comment.content}"`,
            }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for comment notification to user:', err);
                } else {
                    console.log('Published comment notification to user successfully', req.user.id);
                }
            }
        );

        await Notification.create(notificationPayloadForCommenter);


        res.status(201).json(comment);
    } catch (error) {
        console.error('Error in /:postId/comments:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:postId/comments/:commentId', authenticate, async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    try {
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to edit this comment' });
        }

        comment.content = content;
        await comment.save();

        const notificationPayloadForPostAuthor = {
            userId: post.authorId, 
            relatedUserId: req.user.id, 
            postId: post.id,
            type: 'comment_edit',
            content: `${req.user.username} edytował komentarz: "${comment.content}"`,
        };

        mqttClient.publish(
            `user/${post.authorId}/notifications`,  
            JSON.stringify({
                postId: postId,
                type: 'comment_edit',
                contentText: `Twój post otrzymał edytowany komentarz: "${comment.content}"`,
            }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for comment edit notification to post author:', err);
                } else {
                    console.log('Published comment edit notification to post author successfully');
                }
            }
        );

        await Notification.create(notificationPayloadForPostAuthor);

        const notificationPayloadForCommenter = {
            userId: req.user.id, 
            relatedUserId: post.authorId, 
            postId: post.id,
            type: 'comment_edit',
            content: `Edytowałeś komentarz: "${comment.content}"`,
        };

        mqttClient.publish(
            `user/${req.user.id}/notifications`,  
            JSON.stringify({
                postId: postId,
                type: 'comment_edit',
                contentText: `Edytowałeś komentarz: "${comment.content}"`,
            }),
            (err) => {
                if (err) {
                    console.error('MQTT publish error for comment edit notification to user:', err);
                } else {
                    console.log('Published comment edit notification to user successfully', req.user.id);
                }
            }
        );

        await Notification.create(notificationPayloadForCommenter);

        res.status(200).json(comment);
    } catch (error) {
        console.error('Error in /:postId/comments/:commentId:', error);
        res.status(500).json({ error: error.message });
    }
});


router.delete('/:postId/likes', authenticate, async (req, res) => {
    const { postId } = req.params;
    try {
        const like = await Like.findOne({ where: { userId: req.user.id, postId } });

        if (!like) {
            return res.status(404).json({ error: 'Like not found' });
        }

        await like.destroy();

        const likeCount = await Like.count({ where: { postId } });
        mqttClient.publish(`posts/${postId}/likes`, JSON.stringify({ likes: likeCount }));

        res.status(200).json({ likes: likeCount });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while removing the like' });
    }
});


module.exports = router;
