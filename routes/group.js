const path=require('path');
const express=require('express')
const router=express.Router()

const groupController=require("../controller/group")
const Auth=require('../MiddleWare/auth')

router.post('/createGroup',Auth.authenticate,groupController.postCreateGroup);
router.get("getAllGroups",Auth.authenticate,groupController.getAllGroups);
router.get('/getChatData/:groupId',Auth.authenticate,groupController.getGroupChat);
router.get('/getUserGroups',Auth.authenticate, groupController.getUserGroups)
router.get('/getGroupUser/:groupId',Auth.authenticate, groupController.getGroupUser)
router.post('/removeUserFromGroup',Auth.authenticate,groupController.removeUserFromGroup)
router.post('/makeUserAdmin',Auth.authenticate,groupController.makeUserAdmin)
router.post('/addNewGroupMembers',Auth.authenticate,groupController.addNewGroupMembers)


module.exports=router