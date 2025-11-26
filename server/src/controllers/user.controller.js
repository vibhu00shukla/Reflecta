const { validationResult } = require('express-validator'); 
const blacklistTokenModel = require('../models/blacklistToken.model');
const userModel = require('../models/user.model');
const userService = require('../services/user.service');

module.exports.registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        const userAlreadyExists = await userModel.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ message: 'user with this email already exists' });
        }

        const hashPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            name,
            email,
            password: hashPassword
        });

        const token = user.generateAuthToken(); 

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({ token, user });
    } catch (err) {
        next(err);
    }
};


module.exports.loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = user.generateAuthToken();

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ token, user });
    } catch (err) {
        next(err);
    }
};


module.exports.getUserProfile = async (req, res, next) => {
    try {
        const user = req.user; 
        return res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
};


module.exports.logoutUser = async (req, res, next) => {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        res.clearCookie('token');

        const exists = await blacklistTokenModel.findOne({ token });

        if (!exists) {
            await blacklistTokenModel.create({ token });
        }

        return res.status(200).json({ message: "logged out successfully" });
    } catch (err) {
        next(err);
    }
};
module.exports.deleteUserAccount = async (req, res, next) => {
    try {
        const userId = req.user._id;
        await userService.deleteUserById(userId);
        res.clearCookie('token');
        return res.status(200).json({ message: "User account deleted successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports.updateUserProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }   
        const userId = req.user._id;
        const { name, oldPassword, newPassword } = req.body;
        const updatedUser = await userService.updateUser(userId, {
            name,
            oldPassword,        
            newPassword
        });
        return res.status(200).json({ message: "User profile updated successfully", user: updatedUser });
    }
    catch (err) {
        next(err);
    }
};