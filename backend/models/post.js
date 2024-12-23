const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');

const Post = sequelize.define('Post', {
    image: {
        type: DataTypes.BLOB,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
});

Post.belongsTo(User, { foreignKey: 'authorId' });

module.exports = Post;
