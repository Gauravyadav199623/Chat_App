const path =require('path');
const fs=require('fs')

const express=require('express');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');


const app=express()
const cors=require("cors")

const User=require('./models/user');
const Chat=require('./models/chatdata')

const userRoutes=require('./routes/user')




app.use(cors())
// app.use(express.static(__dirname));
app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));
app.use(userRoutes)


User.hasMany(Chat)
Chat.belongsTo(User)

sequelize
.sync()
// .sync({force:true})
.then(result=>{
    app.listen(4000);
})
.catch(err=>{
    console.log(err)
});
