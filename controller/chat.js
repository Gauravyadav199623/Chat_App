const User=require('../models/user')
const Chat=require('../models/chatdata')
const Group=require('../models/group')
const { uploadToS3 } = require('../services/S3services'); // Adjust the path accordingly
const { text } = require('body-parser');



const getChatData = async (req, res, next) => {
    try {
        const groupId = req.query.groupId;
        console.log(req.query,".....query of getchat data");
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


const { Op } = require('sequelize');



const chatgetChatData= async (req, res) => {
    try {
        const groupId = req.params.groupId;

        let messages;

        if (req.headers['latest-local-timestamp']) {
            // If Latest-Local-Timestamp header is present, fetch only new messages
            messages = await Chat.findAll({
                where: {
                    groupId: groupId,
                    createdAt: {
                        [Op.gt]: new Date(req.headers['latest-local-timestamp'])
                    }
                }
            });
        } else {
            // If Latest-Local-Timestamp header is not present, fetch all messages
            messages = await Chat.findAll({
                where: {
                    groupId: groupId
                }
            });
        }

        res.status(200).json({ chat: messages });
    } catch (error) {
        console.error('Error fetching new messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
            isMedia: false,
            userId: userId,
            groupId: groupId,
            mediaType:"text"

        });
        res.status(201).json({ newMessage: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
};

const uploadMedia = async (req, res) => {
    try {
        const groupId = req.body.groupId;
        const userId = req.user.id;
        const mediaData = req.files.map(file => ({
            data: file.buffer,
            filename: `group${groupId}/user${userId}/${Date.now()}_${file.originalname}`
        }));

        // Determine media type based on the file extension
        const mediaType = req.files[0].mimetype.startsWith('image/') ? 'image' : 'video';

        const mediaUrls = await Promise.all(mediaData.map(async media => {
            const mediaUrl = await uploadToS3(media.data, media.filename);
            return mediaUrl;
        }));
        
        console.log(req.body,"<<<<<<<<<<<<<<<<req.body");
        console.log(req.files,"<<<<<<<<<<<<<<<<req.file");
        // console.log(imageUrls,"<<<<<<<<<<<<<<<<imageUrl");

        const chatEntries = await Promise.all(mediaUrls.map(async mediaUrl => {
            const data = await Chat.create({
                message: mediaUrl,
                userId: userId,
                groupId: groupId,
                isMedia: true, // Change this to 'isMedia' or 'isImage' as needed
                mediaType: mediaType
            });
            return data;
        }));

        res.json({ mediaUrls: mediaUrls, mediaType: mediaType, data: chatEntries });
    } catch (error) {
        console.error('Error processing and uploading media:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






module.exports={
    getChatData,
    postChat,
    uploadMedia,
    chatgetChatData
}