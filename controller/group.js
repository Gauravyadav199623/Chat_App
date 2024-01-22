const User=require('../models/user')
const Chat=require('../models/chatdata')
const Group=require('../models/group')
const UserAndGroup=require('../models/userGroup')


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
            const user = await User.findByPk(req.user.id); // Assuming req.user.id is the admin user ID
            const initialMessage = `Welcome to the group "${groupName}" ${user.name}`; // Customize your initial message
            await Chat.create({
                message: initialMessage,
                type: "system", // You might want a system message type for group initialization messages
                userId: user.id,
                groupId: newGroup.id,
            });
            const adminUser = await UserAndGroup.findOne({
                where: { userId: req.user.id, groupId: newGroup.id },
            });
            await adminUser.update({ admin: true });


        res.status(201).json({ message: 'Group created successfully!' });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Internal Server Error' });    }
}
const getAllGroups=async (req, res, next) => {
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
        const groupChat = await Chat.findAll({
            include: [
                { model: User },
                { model: Group }
            ],
            where: { groupId: groupId }
        });
        res.status(200).json({ chat: groupChat, user: req.user });
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
  const getGroupUser = async (req, res, next) => {
    try {
        const groupId = req.params.groupId;
        console.log(">>>>>>>>>>>>>>>>>>>>",groupId,"<<<<<<<<<<<<<<<<<<<<<<<<<");
        const group = await Group.findByPk(groupId);
        const groupUsers = await group.getUsers();//! kim sequelize(tabel1.gettabel2)
        // const groupUsers = await User.findAll({
        //     include: [{
        //         model: Group,
        //         as: 'groups',
        //         where: { id: groupId },
        //         through: {model: UserAndGroup, attributes: [] },  // This line excludes the junction table from the result
        //     }],
        // });
        res.status(200).json({ users: groupUsers });
    } catch (error) {
        console.log(error);
    }
};

const removeUserFromGroup = async (req, res, next) => {
    try {
        const { memberId, groupId } = req.body;
        const group = await Group.findByPk(groupId);

        // Check if the requester is an admin of the group
        const adminUser = await UserAndGroup.findOne({
            where: { userId: req.user.id, groupId: groupId }
        });

        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Permission denied. User must be an admin to perform this operation.' });
        }

        // Check if the user to be removed exists in the group
        const userToRemove = await UserAndGroup.findOne({
            where: { userId: memberId, groupId: groupId }
        });

        if (!userToRemove) {
            return res.status(404).json({ message: 'User not found in the group.' });
        }

        // Remove the user from the group
        await group.removeUser(memberId);

        res.status(200).json({ message: 'User removed from the group successfully' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const makeUserAdmin = async (req, res, next) => {
    try {
        const { memberId, groupId } = req.body;

        // Check if the requester is an admin of the group
        const adminUser = await UserAndGroup.findOne({
            where: { userId: req.user.id, groupId: groupId }
        });

        if (!adminUser || !adminUser.admin) {
            return res.status(403).json({ message: 'Permission denied. User must be an admin to perform this operation.' });
        }

        // Check if the user to be made admin exists in the group
        const newAdmin = await UserAndGroup.findOne({
            where: { userId: memberId, groupId: groupId }
        });

        await newAdmin.update({ admin: true });

        res.status(200).json({ message: 'User is now an admin.' });
    } catch (error) {
        console.error('Error making user admin:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const addNewGroupMembers=async(req,res,next)=>{
    try {
        const { groupId, members } = req.body;

        // Fetch the existing group
        const group = await Group.findByPk(groupId);

        // Fetch the users to be added
        const usersToAdd = await User.findAll({
            where: {
                id: members,
            },
        });

        // Add users to the existing group
        await group.addUsers(usersToAdd, { through: { admin: false } });

        res.status(200).json({ message: 'Users added to the group successfully!' });
    } catch (error) {
        console.error('Error adding users to the group:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports={
    postCreateGroup,
    getAllGroups,
    getGroupChat,
    getUserGroups,
    getGroupUser,
    removeUserFromGroup,
    makeUserAdmin,
    addNewGroupMembers
}