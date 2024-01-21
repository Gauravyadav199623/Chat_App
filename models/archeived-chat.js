const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const ArchivedChat=sequelize.define("ArchivedChat",{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true,
        allowNull: false,
    },
    message:Sequelize.TEXT(),
    isImage:{
        type:Sequelize.BOOLEAN,
        defaultValue : false

    },
    userId:Sequelize.INTEGER,
    groupId:Sequelize.INTEGER
       

});



module.exports=ArchivedChat