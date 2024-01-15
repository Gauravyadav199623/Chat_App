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
const jwt = require('jsonwebtoken');
function getUserIdFromToken(authorizationHeader) {
    try {
      // Extract the token from the Authorization header
      const token = authorizationHeader.split(' ')[1];
  
      // Verify and decode the token
      const decoded = jwt.verify(token, 'secreteKey'); // Replace 'your-secret-key' with your actual JWT secret
  
      // Extract and return the user ID from the decoded token
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

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
app.get('/getUserGroups', async (req, res,next) => {
    try{
        const token=req.header('Authorization');  //? we send this from front end through header
        // console.log(token);
        const user=jwt.verify(token,'secreteKey');  //?secreteKey help in decoding
        // console.log("userID>>>>>>",user.userId)
        User.findByPk(user.userId).then(user=>{
            console.log(JSON.stringify(user));
            req.user=user; //!kim vvvimp
            next();
        })   
        
    }catch(err){
        console.log(err);
    }
})
app.get('/getUserGroups', async (req, res) => {
    try {
        const user=req.user;
        // console.log(req,".................user");
        const groups=await user.getGroups()
        return res.status(200).json({ groups, message: "All groups successfully fetched" })
    } catch (error) {
        console.log(error);
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
