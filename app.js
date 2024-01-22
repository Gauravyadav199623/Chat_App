const path =require('path');
const fs=require('fs')

const express=require('express');
const bodyParser=require('body-parser');
const sequelize=require('./util/database');


const cors=require("cors")
const http = require('http');
const app=express()
const cronService = require('./services/cron');
cronService.job.start();
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

        // Check if the received messages is an array
        if (Array.isArray(data.messages)) {
            // Iterate over the array and emit each message to the group
            data.messages.forEach((message) => {
                io.to(data.groupId).emit('chatMessage', {
                    messageType: data.messageType,
                    message: [message],
                    groupId: data.groupId,
                    name: data.tokenName
                });
            });
        } else {
            // Handle single message
            io.to(data.groupId).emit('chatMessage', {
                messageType: data.messageType,
                message: [data.message],
                groupId: data.groupId,
                name: data.tokenName
            });
        }
    });

    socket.on('joinGroup', (groupId) => {
        console.log("groupId join", groupId);
        socket.join(groupId);
    });
});





User.hasMany(Chat)
Chat.belongsTo(User)

Group.hasMany(Chat)
Chat.belongsTo(Group)

User.belongsToMany(Group, {through : UserAndGroup})
Group.belongsToMany(User, {through : UserAndGroup})



const PORT = process.env.PORT || 4000;
sequelize
  .sync()
  .then(result => {
    app.listen(PORT);
    console.log(`server is running at port:${PORT}`);
  })
  .catch(err => {
    console.log(err);
  });

