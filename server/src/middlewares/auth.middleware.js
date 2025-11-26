const jwt = require('jsonwebtoken');// used to verify JWT tokens
const userModel = require('../models/user.model');// user model to fetch user details
const blacklistTokenModel = require('../models/blacklistToken.model');// model to check blacklisted tokens

module.exports.authUser =async (req,res,next) =>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Authentication token missing"});
    }
    const blacklistToken = await blacklistTokenModel.findOne({token})

    if(blacklistToken){
        return res.status(401).json({message:"Token is blacklisted. Please login again."});
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET) //returns the decoded payload (usually { _id, email, iat, exp })
        const user = await userModel.findOne({_id:decoded._id});

        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).json({message:"Invalid authentication token"});
    }
}