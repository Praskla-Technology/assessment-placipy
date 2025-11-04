// @ts-nocheck
const express = require('express');
const userController = require('../auth/auth.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/respond-to-new-password-challenge', userController.respondToNewPasswordChallenge);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware.authenticateToken, userController.getProfile);

router.put('/profile', authMiddleware.authenticateToken, (req, res) => {
    // Update user profile
    res.json({
        message: 'User profile updated successfully',
        user: req.user
    });
});

module.exports = router;