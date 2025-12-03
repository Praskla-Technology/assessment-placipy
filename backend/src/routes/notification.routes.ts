// @ts-nocheck
const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const notificationService = require('../services/NotificationService');
const { getUserAttributes } = require('../auth/cognito');

const router = express.Router();

/**
 * Helper function to extract email from request
 * Uses multiple possible JWT fields and falls back to Cognito profile lookup.
 */
async function getEmailFromRequest(req: any): Promise<string> {
    const u = req.user || {};

    // Try the most common locations first
    const candidates = [
        u.email,
        u['custom:email'],
        (u.username && String(u.username).includes('@')) ? String(u.username) : '',
        (u['cognito:username'] && String(u['cognito:username']).includes('@')) ? String(u['cognito:username']) : '',
        (u.sub && String(u.sub).includes('@')) ? String(u.sub) : ''
    ];

    let email = candidates.find((c: any) => typeof c === 'string' && c.includes('@'));

    // Fallback: fetch from Cognito using userId
    if (!email) {
        const userId = u['cognito:username'] || u.username || u.sub;
        if (userId) {
            try {
                const userInfo = await getUserAttributes(userId);
                if (userInfo && userInfo.attributes && userInfo.attributes.email) {
                    email = userInfo.attributes.email;
                }
            } catch (error) {
                console.error('Error fetching user attributes for notifications:', error);
            }
        }
    }

    if (!email) {
        throw new Error('User email not found. Please log in again.');
    }

    return String(email).toLowerCase();
}

/**
 * GET /api/student/notifications
 * Get all notifications for the authenticated student
 */
router.get('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const email = await getEmailFromRequest(req);
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey as string) : null;

        const result = await notificationService.getNotificationsForUser(email, limit, lastKey);
        
        res.status(200).json({
            success: true,
            data: result.items,
            lastKey: result.lastKey
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch notifications'
        });
    }
});

/**
 * POST /api/student/notifications/:id/read
 * Mark a specific notification as read
 */
router.post('/:id/read', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const email = await getEmailFromRequest(req);
        const notificationId = req.params.id;

        await notificationService.markAsRead(notificationId, email);
        
        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark notification as read'
        });
    }
});

/**
 * POST /api/student/notifications/mark-all
 * Mark all notifications as read for the authenticated student
 */
router.post('/mark-all', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const email = await getEmailFromRequest(req);
        const count = await notificationService.markAllAsRead(email);
        
        res.status(200).json({
            success: true,
            message: `Marked ${count} notifications as read`,
            count
        });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark all notifications as read'
        });
    }
});

module.exports = router;

