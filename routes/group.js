const path=require('path');
const express=require('express')
const router=express.Router()

const groupController=require("../controller/group")
const Auth=require('../MiddleWare/auth')

router.post('/createGroup',Auth.authenticate,groupController.postCreateGroup)


module.exports=router