const userModel = require('../models/user.model');

module.exports.createUser = async ({name,email,password})=>{
    if(!name || !email ||!password){
        throw new Error("All fields are required to create a user");
    }

    const user = await userModel.create({
        name,
        email,
        password
    })
    return user;
}

module.exports.updateUser = async(userId,{name,oldPassword,newPassword}) =>{
    const user = await userModel.findById(userId).select('+password');
    if(!user){
        throw new Error("User not found");
    }

    const updates ={}
    if(name){
        updates.name=name;
    }

    if(oldPassword && newPassword){
        const isMatch = await user.comparePassword(oldPassword);
        if(!isMatch){
            throw new Error("current password is incorrect");
        }
        updates.password = await userModel.hashPassword(newPassword);
    }
    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updates,
        {new: true,runValidators :true}

    );

    return updatedUser;


}

module.exports.deleteUserById = async(userId)=>{

    await userModel.findByIdAndDelete(userId);
    return;
}