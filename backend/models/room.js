const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user');
const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'id',
        },
    },
    user2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
}, {
    timestamps: true, 
});

Room.belongsTo(User, { as: 'User1', foreignKey: 'user1Id' });
Room.belongsTo(User, { as: 'User2', foreignKey: 'user2Id' });

module.exports = Room;
