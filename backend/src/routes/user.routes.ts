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

// Ensure DynamoDB service and Cognito helper are available for profile updates
const dynamoDBService = require('../services/DynamoDBService');
const { getUserAttributes } = require('../auth/cognito');

// Profile Management Endpoints
router.put('/profile', authMiddleware.authenticateToken, async (req, res) => {
    try {
        // Derive email similarly to auth.controller.getProfile
        let email = null;
        let userId = null;

        if (req.user && req.user.email) {
            email = req.user.email;
        } else if (req.user && req.user['cognito:username'] && req.user['cognito:username'].includes('@')) {
            email = req.user['cognito:username'];
        } else if (req.user && req.user.username && req.user.username.includes('@')) {
            email = req.user.username;
        } else if (req.user && req.user.sub && req.user.sub.includes('@')) {
            email = req.user.sub;
        } else {
            userId = req.user && (req.user['cognito:username'] || req.user.username || req.user.sub);
        }

        // If we only have a userId, try to resolve email via Cognito
        if (!email && userId) {
            try {
                const userInfo = await getUserAttributes(userId);
                if (userInfo && userInfo.attributes && userInfo.attributes.email) {
                    email = userInfo.attributes.email;
                }
            } catch (cognitoErr) {
                // continue - we'll return a helpful error below
            }
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email not found in token or Cognito. Cannot update profile.'
            });
        }

        // Build an updates object only with allowed/profile fields coming from client
        const allowedFields = [
            'name', 'firstName', 'lastName', 'phone', 'designation', 'department',
            'regNo', 'registrationNumber', 'collegeName', 'college', 'year', 'yearOfStudy', 'section', 'enrollmentDate'
        ];

        const updates = {};
        for (const key of Object.keys(req.body || {})) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        }

        // If client sent firstName/lastName, consolidate into name
        if (!updates.name && (req.body.firstName || req.body.lastName)) {
            updates.name = `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No updatable profile fields provided' });
        }

        // Use DynamoDB service to update existing item (will throw if not found)
        try {
            // Dev-only debug: show which email and which fields we will update
            if (process.env.NODE_ENV !== 'production') {
                try {
                    const safePreview = Object.keys(updates).reduce((acc, k) => {
                        // redact long values
                        const v = updates[k];
                        acc[k] = (typeof v === 'string' && v.length > 100) ? v.slice(0, 100) + '... (truncated)' : v;
                        return acc;
                    }, {});
                    console.debug('[dev] profile update target:', { email, updates: safePreview });
                } catch (dbg) {
                    console.debug('[dev] profile update preview failed', dbg.message || dbg);
                }
            }

            const updated = await dynamoDBService.updateUserByEmail(email, updates);
            return res.json({ success: true, message: 'Profile updated successfully', profile: updated });
        } catch (dbErr) {
            console.error('DynamoDB update error:', dbErr && dbErr.message ? dbErr.message : dbErr);
            if (dbErr && (dbErr.message || '').toLowerCase().includes('user not found')) {
                return res.status(404).json({ success: false, message: 'User not found in database. Cannot update.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to persist profile update', error: dbErr && dbErr.message ? dbErr.message : String(dbErr) });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

router.put('/profile/password', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const email = req.user.email;

        // Validate current password with Cognito
        // Change password using Cognito
        // In real implementation, use AWS Cognito change password API

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

router.put('/profile/preferences', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            theme,
            language,
            timezone,
            dateFormat,
            emailDigest,
            notificationSound,
            autoLogout
        } = req.body;

        const preferences = {
            userId,
            theme,
            language,
            timezone,
            dateFormat,
            emailDigest,
            notificationSound,
            autoLogout,
            updatedAt: new Date().toISOString()
        };

        // In real implementation, save preferences to DynamoDB
        // await dynamoDBService.saveUserPreferences(userId, preferences);

        res.json({
            success: true,
            message: 'Preferences saved successfully',
            preferences
        });
    } catch (error) {
        console.error('Preferences save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save preferences'
        });
    }
});

router.get('/profile/preferences', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // In real implementation, get preferences from DynamoDB
        const defaultPreferences = {
            theme: 'light',
            language: 'English',
            timezone: 'America/Los_Angeles',
            dateFormat: 'MM/DD/YYYY',
            emailDigest: 'daily',
            notificationSound: true,
            autoLogout: 60
        };

        res.json({
            success: true,
            preferences: defaultPreferences
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get preferences'
        });
    }
});

router.put('/profile/security', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            twoFactorEnabled,
            emailNotifications,
            smsNotifications
        } = req.body;

        const securitySettings = {
            userId,
            twoFactorEnabled,
            emailNotifications,
            smsNotifications,
            updatedAt: new Date().toISOString()
        };

        // In real implementation, update security settings in DynamoDB
        // await dynamoDBService.updateSecuritySettings(userId, securitySettings);

        res.json({
            success: true,
            message: 'Security settings updated successfully',
            settings: securitySettings
        });
    } catch (error) {
        console.error('Security settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update security settings'
        });
    }
});

router.get('/profile/security', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // In real implementation, get security settings from DynamoDB
        const defaultSettings = {
            twoFactorEnabled: false,
            emailNotifications: true,
            smsNotifications: false
        };

        res.json({
            success: true,
            settings: defaultSettings
        });
    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get security settings'
        });
    }
});

router.put('/profile/picture', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { profilePictureUrl } = req.body;

        // Validate that the URL is from our approved static images
        const allowedImages = [
            'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        ];

        if (!allowedImages.includes(profilePictureUrl)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid profile picture URL'
            });
        }

        // In real implementation, update user profile in DynamoDB
        // await dynamoDBService.updateUserProfilePicture(userId, profilePictureUrl);

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePictureUrl
        });
    } catch (error) {
        console.error('Profile picture update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile picture'
        });
    }
});

module.exports = router;

// Development-only debug routes
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug/user-by-email', authMiddleware.authenticateToken, async (req, res) => {
        try {
            const email = req.query.email || req.user && (req.user.email || req.user.username || req.user['cognito:username']);
            if (!email) {
                return res.status(400).json({ success: false, message: 'email query param or token-derived email required' });
            }

            const item = await dynamoDBService.getUserDataByEmail(String(email));
            return res.json({ success: true, item });
        } catch (err) {
            console.error('Debug route error:', err);
            res.status(500).json({ success: false, message: 'Debug lookup failed', error: err.message });
        }
    });
}