// routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware'); // your auth middleware

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be >= 6 chars')
  ],
  userController.registerUser
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  userController.loginUser
);

// Get current user
router.get('/me', authMiddleware.authUser, userController.getUserProfile);

// Logout
router.post('/logout', authMiddleware.authUser, userController.logoutUser);

// Delete account
router.delete('/me', authMiddleware.authUser, userController.deleteUserAccount);

// Update profile (name / change password)
router.patch(
  '/me',
  authMiddleware.authUser,
  [
    body('name').optional().trim().notEmpty(),
    body('oldPassword').optional(),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be >= 6 chars')
  ],
  userController.updateUserProfile
);

module.exports = router;


