const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const User=require('./user')
const UserAndGroup = require('./userGroup'); // Import the UserAndGroup model



const Group=sequelize.define('group',{
    id:
    {
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        unique:true
    },
    groupName:{
        type:Sequelize.STRING,
        allowNull:false,
    }
})


// Group.belongsToMany(User, { through: 'UserAndGroup' });

module.exports=Group