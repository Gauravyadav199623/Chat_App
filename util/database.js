const Sequelize = require('sequelize');

require('dotenv').config();

const sequelize = new Sequelize("WEChat", "root","nodecomplete", {
  dialect: 'mysql',
  host: "localhost",
  logging:false
});

module.exports = sequelize;