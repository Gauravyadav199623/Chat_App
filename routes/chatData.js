const path=require('path');

const express=require('express')

const chatController=require('../controller/chat');
const UserAuth=require('../MiddleWare/auth')

const multerMiddleware = require('../middleware/multer')
const upload = multerMiddleware.multer.single('image');

const router=express.Router()

router.get("/getChatData",UserAuth.authenticate,chatController.getChatData)
router.post('/postChat',UserAuth.authenticate,chatController.postChat)
router.post('/uploadImage',UserAuth.authenticate,upload,chatController.uploadImage)




module.exports=router