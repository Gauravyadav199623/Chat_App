const User=require('../models/user')

const bcrypt = require('bcrypt');    // can encrypting password only way


const saltRounds = 10;




const postAddUser=async(req,res,next)=>{
    // console.log(req.body)
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password; 
    try{
        bcrypt.hash(password,saltRounds, async(err,hash)=>{       //* encrypting password(one way)

            const data=await User.create({name:name, email:email, password:hash}); //!kim
            
            res.status(201).json({userAdded:data, redirect: '/login'})
        })
    }catch(err){
        console.log(err);
    }
}


const userLogin=async(req,res,next)=>{
   
    
    const email=req.body.email;
    const password=req.body.password;
   
    
    try{
        let user=await User.findOne({where:{email:email}})
        // let userData=user.toJSON()
        // console.log(JSON.stringify(userData)+"user Data");
        if (user){
            console.log(JSON.stringify(user.dataValues)+"<-User");
            bcrypt.compare(password,user.password,(err,result)=>{   //* comparing the encrypted password withe the entered one after converting it too
                //this kind of encryption only work one way ie we can get back our originally entered value
                if(result==true){
                    res.status(200).json({  message: 'User login successfully',token: generateAccessToken(user.id, user.name,user.ispremiumuser)});//?decrypting our data using token
                    // res.render('dashboard', { message: 'User login successfully' });
                }else{
                    res.status(401).json({message:"User not authorized"})
                }
            })
        } else {
            res.status(404).json({ message: "user not found" });
        }

      }catch(err){
          console.log(err);
      }
}



module.exports={
  
    postAddUser,
    userLogin
}