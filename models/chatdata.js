const Sequelize=require('sequelize');
const sequelize=require('../util/database');
const User = require('./user'); // Import the User model
const Group = require('./group'); // Import the User model


const Chat =sequelize.define('chat',{
    id:
    {
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        unique:true
    },
    message:Sequelize.STRING,
    type:Sequelize.STRING
})


Chat.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Chat.belongsTo(Group, { foreignKey: 'groupId', as: 'Group' });

module.exports=Chat;