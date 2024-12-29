const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');

const Follower = sequelize.define('Follower', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
}, {
  timestamps: true,
});

User.belongsToMany(User, { as: 'Followers', through: Follower, foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'Following', through: Follower, foreignKey: 'followerId' });

Follower.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
Follower.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

module.exports = Follower;
