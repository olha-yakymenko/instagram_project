const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const Post = require('./post');
const User = require('./user');

const Comment = sequelize.define('Comment', {
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    authorId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
    postId: {
        type: DataTypes.INTEGER,
        references: {
            model: Post,
            key: 'id',
        },
    },
});

Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
User.hasMany(Comment, { foreignKey: 'authorId' });
Comment.belongsTo(User, { foreignKey: 'authorId' });

module.exports = Comment;
