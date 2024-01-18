const path =require('path');
const fs=require('fs')

const express=require('express');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');


const cors=require("cors")
const http = require('http');
// const socketIO = require('socket.io');
const app=express()
require('dotenv').config();


const server=http.createServer(app);
const{Server}=require('socket.io')
const { instrument } = require("@socket.io/admin-ui");
const io=new Server(server, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  });
  
  instrument(io, {
    auth: false
  });
// const socketService = require("./services/websocket")


const Chat=require('./models/chatdata')
const User=require('./models/user');
const Group=require('./models/group')
const UserAndGroup = require('./models/userGroup');


const userRoutes=require('./routes/user')
const chatRoutes=require('./routes/chatData')
const groupRoutes=require('./routes/group')



app.use(cors())
// app.use(express.static(__dirname));
app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));
app.use(userRoutes)
app.use(chatRoutes)
app.use(groupRoutes)


io.on('connection', (socket) => {
    console.log(`User connected with id: ${socket.id}`);

    socket.on('chatMessage', (data) => {
        console.log('Received chat message on server:', data);
        io.to(data.groupId).emit('chatMessage', { message: data.message, groupId: data.groupId,name:data.tokenName });
    });

    socket.on('joinGroup', (groupId) => {
        console.log("groupId join",groupId);
        socket.join(groupId);
    });

});







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
    server.listen(4000);
})
.catch(err=>{
    console.log(err)
});
