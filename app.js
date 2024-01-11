const path =require('path');
const fs=require('fs')

const express=require('express');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');


const app=express()
const cors=require("cors")

const Chat=require('./models/chatdata')
const User=require('./models/user');
const Group=require('./models/group')
const UserAndGroup = require('./models/userGroup');


const userRoutes=require('./routes/user')
const chatRoutes=require('./routes/chatData')




app.use(cors())
// app.use(express.static(__dirname));
app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));
app.use(userRoutes)
app.use(chatRoutes)


User.hasMany(Chat)
Chat.belongsTo(User)

Group.hasMany(Chat)
Chat.belongsTo(Group)

User.belongsToMany(Group, {through : UserAndGroup})
Group.belongsToMany(User, {through : UserAndGroup})

sequelize
.sync()
// .sync({force:true})
.then(result=>{
    app.listen(4000);
})
.catch(err=>{
    console.log(err)
});
