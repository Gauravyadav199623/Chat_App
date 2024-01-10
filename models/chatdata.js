const Sequelize=require('sequelize');
const sequelize=require('../util/database');
const User = require('./user'); // Import the User model

const chat =sequelize.define('chat',{
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


chat.belongsTo(User, { foreignKey: 'userId', as: 'User' });

module.exports=chat;