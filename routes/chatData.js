const path=require('path');

const express=require('express')

const chatController=require('../controller/chat');
const UserAuth=require('../MiddleWare/auth')

const router=express.Router()

router.get("/getChatData",UserAuth.authenticate,chatController.getChatData)
router.post('/postChat',UserAuth.authenticate,chatController.postChat)



module.exports=router