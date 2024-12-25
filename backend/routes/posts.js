const express = require('express');
const Post = require('../models/post');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');  
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const router = express.Router();
router.use(cookieParser()); 

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
                image: `http://localhost:5007${post.image}`, 
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
                image: `http://localhost:5007${post.image}`,  
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

