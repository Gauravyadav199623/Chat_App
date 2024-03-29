const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const userAndGroup=sequelize.define('UserAndGroup',{
    id:
    {
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        unique:true
    },
    admin:
    { 
        type:Sequelize.BOOLEAN     
    }
})
module.exports=userAndGroup