const User=require('../models/user')
const Chat=require('../models/chatdata')
const Group=require('../models/group')


const getChatData = async (req, res, next) => {
    try {
        const groupId = req.query.groupId;

        let chatData;
        if (groupId) {
            // If groupId is provided, include the Group model in the query
            chatData = await Chat.findAll({
                include: [
                    { model: User },
                    { model: Group }
                ],
                where: { groupId: groupId }
            });
        } else {
            // If groupId is not provided (common group), exclude the Group model
            chatData = await Chat.findAll({
                include: [{ model: User }]
            });
        }

        res.status(200).json({ chat: chatData, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.toString() });
    }
};




const postChat = async (req, res, next) => {
    try {
        console.log("user id",req.user.id);
        const groupId = req.body.groupId; // Extract group ID from the request body
        const message = req.body.message;
        const userId = req.user.id;

        const data = await Chat.create({
            message: message,
            type: "string",
            userId: userId,
            groupId: groupId // Include group ID in the chat entry

        });
        res.status(201).json({ newMessage: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
};



module.exports={
    getChatData,
    postChat
}