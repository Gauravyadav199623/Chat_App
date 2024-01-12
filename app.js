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
const groupRoutes=require('./routes/group')




app.use(cors())
// app.use(express.static(__dirname));
app.use(bodyParser.json({ extended: false }));
app.use(express.static('public'));
app.use(userRoutes)
app.use(chatRoutes)
app.use(groupRoutes)

app.get('/getAllUsers', async (req, res) => {
    try {
      // Assuming you have a model named User
      const users = await User.findAll(); // Adjust this based on your model
  
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.get('/getAllGroups', async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Modify your existing route to fetch chat data for a specific group
app.get('/getChatData/:groupId', async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const groupChat = await Chat.findAll({ where: { groupId } });
        res.status(200).json({ chat: groupChat });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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
    app.listen(4000);
})
.catch(err=>{
    console.log(err)
});
