const path=require('path');

const express=require('express')

const userController=require('../controller/user');



const router=express.Router()

router.post('/add-user',userController.postAddUser )
router.post('/login',userController.userLogin)

router.get('/getUser/:userId',userController.getuserid)
router.get('/getAllUsers',userController.getAllUsers)


router.get("/login",(req,res,next)=>{
    res.sendFile("login.html",{root:"views"})
})
router.get('/signUp',(req,res,next)=>{
    res.sendFile("signUp.html",{root:'views'})
})
router.get('/chat',(req,res,next)=>{
    res.sendFile("chat.html",{root:'views'})
})

module.exports=router