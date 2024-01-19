const User=require('../models/user')
const Chat=require('../models/chatdata')
const Group=require('../models/group')
const { uploadToS3 } = require('../services/S3services'); // Adjust the path accordingly



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
            // If groupId is not provided (for first), exclude the Group model
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
            isImage: false,
            userId: userId,
            groupId: groupId // Include group ID in the chat entry

        });
        res.status(201).json({ newMessage: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
};

const uploadImage=async (req, res) => {
    try {
        // Access the uploaded file from req.file.buffer
        const imageData = req.file.buffer;
        const groupId = req.body.groupId; // Extract group ID from the request body
        const userId = req.user.id;

        const filename = `group${groupId}/user${userId}/${Date.now()}_${req.file.originalname}`;

        // Use your S3 upload function to upload the image to AWS S3
        const imageUrl = await uploadToS3(imageData, filename);
        console.log(req.body,"<<<<<<<<<<<<<<<<req.body");
        console.log(imageUrl,"<<<<<<<<<<<<<<<<imageUrl");
        // Create a chat entry for the uploaded image
        const data = await Chat.create({
            message: imageUrl,
            userId: userId, 
            groupId: groupId, 
            isImage: true
        });

        // Respond with the generated media URL
        res.json({ mediaUrl: imageUrl,data:data });
    } catch (error) {
        console.error('Error processing and uploading image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};





module.exports={
    getChatData,
    postChat,
    uploadImage
}