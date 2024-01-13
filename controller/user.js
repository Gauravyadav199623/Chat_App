const User=require('../models/user')
const Group=require('../models/group')

const bcrypt = require('bcrypt');    // can encrypting password only way
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const generateAccessToken=(id,name)=>{
    return jwt.sign({userId:id, name:name},'secreteKey')    //*encrypting data both way(ie can to decrypt to get the original values (approx))
}


const postAddUser = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    console.log('<<<<<<<<<<<<<<<<<<<<<<postAddUser>>>>>>>>>>>>>>>>>>>>>>>>');

    try {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            const user = await User.create({ name: name, email: email, password: hash });
            console.log("<<<<<<<<<<<<<<<<created user>>>>>>>>>>>>>>>>");

            // Check if the common group exists, create it if not
            const commonGroup = await Group.findOne({ where: { groupName: 'Common Group' } });
            if (!commonGroup) {
                const newCommonGroup = await Group.create({ groupName: 'Common Group' });
                await newCommonGroup.addUsers(user, { through: { admin: false } });
                await newCommonGroup.save();
                console.log("<<<<<<<<<<<<<<<<new group>>>>>>>>>>>>>>>>");
            } else {
                await commonGroup.addUsers(user, { through: { admin: false } });
                await commonGroup.save();
                console.log("<added to comman<<<<<<<<<>");
            }

            res.status(201).json({ userAdded: user, redirect: '/login' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


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
                    res.status(200).json({  message: 'User login successfully',token: generateAccessToken(user.id, user.name)});
                    
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
          res.status(500).json({ message: "Internal server error" });
      }
}
const getuserid=async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findByPk(userId);

        if (user) {
            res.status(200).json({ name: user.name });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(`Error fetching user data for userId ${userId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports={
  
    postAddUser,
    userLogin,
    getuserid
}