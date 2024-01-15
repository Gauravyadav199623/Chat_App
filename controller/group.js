const User=require('../models/user')
const Chat=require('../models/chatdata')
const Group=require('../models/group')
const UserGroup=require('../models/userGroup')


const postCreateGroup=async(req,res,next)=>{
    try {
        console.log("Creating a group...");
        const { groupName, members } = req.body;
        console.log("Group Name:", groupName);
        console.log("Members:", members)

        // Create the group
        const newGroup = await Group.create({ groupName });

        // Find and add users to the group
        const groupMembers = await User.findAll({
            where: {
                id: members,
            },
        });

        await newGroup.addUsers(groupMembers, { through: { admin: false } });

         // Save the created group to the database
         await newGroup.save();

            // Create a chat entry for the group to initialize the chat
            const adminUser = await User.findByPk(req.user.id); // Assuming req.user.id is the admin user ID
            const initialMessage = `Welcome to the group "${groupName}"!`; // Customize your initial message
            await Chat.create({
                message: initialMessage,
                type: "system", // You might want a system message type for group initialization messages
                userId: adminUser.id,
                groupId: newGroup.id,
            });


        res.status(201).json({ message: 'Group created successfully!' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal Server Error' });    }
}
const getAllGroups=async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getGroupChat=async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const groupChat = await Chat.findAll({ where: { groupId } });
        res.status(200).json({ chat: groupChat });
    } catch (error) {
        console.error('Error fetching chat data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getUserGroups=async (req, res) => {
    try {
        const user=req.user;
        // console.log(req,".................user");
        const groups=await user.getGroups()
        return res.status(200).json({ groups, message: "All groups successfully fetched" })
    } catch (error) {
        console.log(error);
    }
  }
module.exports={
    postCreateGroup,
    getAllGroups,
    getGroupChat,
    getUserGroups
}