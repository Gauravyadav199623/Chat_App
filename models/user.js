const Sequelize = require('sequelize');

const sequelize = require('../util/database');
const Group=require('./group')
const UserAndGroup = require('./userGroup'); // Import the UserAndGroup model


const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  email:{
    type: Sequelize.STRING,
    allowNull: false
  },
  password: Sequelize.STRING
  
});
// User.belongsToMany(Group, { through: 'UserAndGroup' });


module.exports = User;
