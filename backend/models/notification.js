const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const Like = require('./like');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    relatedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
}, {
    tableName: 'Notifications',
    timestamps: false,
});

Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Użytkownik, do którego trafia powiadomienie
Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'relatedUser' }); // Użytkownik, który wykonał akcję
Notification.belongsTo(Post, { foreignKey: 'postId' }); // Powiązany post
Notification.belongsTo(Comment, { foreignKey: 'commentId' }); // Powiązany komentarz
Notification.belongsTo(Like, { foreignKey: 'likeId' }); // Powiązane polubienie

module.exports = Notification;

