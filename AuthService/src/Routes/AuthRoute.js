const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const userController = require('../Controllers/UserController');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
// Update user profile
router.get('/profile/:id', userController.getProfile);
router.put('/update-profile/:id', userController.updateProfile);
router.get('/profile', userController.getAllUsers);


module.exports = router;