const jwt = require('jsonwebtoken');
const User=require('../models/user')




const authenticate=(req,res,next)=>{
    try{
        const token=req.header('Authorization');  //? we send this from front end through header
        // console.log(token);
        const user=jwt.verify(token,'secreteKey');  //?secreteKey help in decoding
        // console.log("userID>>>>>>",user.userId)
        User.findByPk(user.userId).then(user=>{
            console.log(JSON.stringify(user));
            req.user=user; //!kim vvvimp
            next();
        })   
        
    }catch(err){
        console.log(err);
    }
}
module.exports={
    authenticate
}