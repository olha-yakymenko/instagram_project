const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');
const User = require('./user'); 
const Room = require('./room') 

const Message = sequelize.define('Message', {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    roomId: { 
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: Room, 
            key: 'id',
        },
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

Message.belongsTo(User, { foreignKey: 'userId' }); 
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(Room, { foreignKey: 'roomId' }); 
Room.hasMany(Message, { foreignKey: 'roomId' });

module.exports = Message;
