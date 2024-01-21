const path=require('path');

const express=require('express')

const chatController=require('../controller/chat');
const UserAuth=require('../MiddleWare/auth')

const multerMiddleware = require('../middleware/multer')
const upload = multerMiddleware.multer.array('media');

const router=express.Router()

router.get("/getChatData",UserAuth.authenticate,chatController.getChatData)
router.post('/postChat',UserAuth.authenticate,chatController.postChat)
router.post('/uploadMedia',UserAuth.authenticate,upload,chatController.uploadMedia)




module.exports=router