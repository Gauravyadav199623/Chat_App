const User=require('../models/user')
const Chat=require('../models/chatdata')


const getChatData = async (req, res, next) => {
    try {
        const chatData = await Chat.findAll({ include: User });
        res.status(200).json({ chat: chatData, user: req.user }); // Include the 'name' property
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
};



const postChat = async (req, res, next) => {
    try {
        console.log("user id",req.user.id);
        const message = req.body.message;
        const userId = req.user.id;

        const data = await Chat.create({
            message: message,
            type: "string",
            userId: userId
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