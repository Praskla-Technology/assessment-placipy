// @ts-nocheck
const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const notificationService = require('../services/NotificationService');
const { getUserAttributes } = require('../auth/cognito');

const router = express.Router();

/**
 * Helper function to extract email from request
 */
async function getEmailFromRequest(req: any): Promise<string> {
    let email = req.user?.email;
    
    if (!email) {
        // Try username if it contains @
        if (req.user?.username && req.user.username.includes('@')) {
            email = req.user.username;
        } else if (req.user?.sub && req.user.sub.includes('@')) {
            email = req.user.sub;
        } else {
            // Fetch from Cognito
            try {
                const attributes = await getUserAttributes(req.user?.sub || req.user?.username);
                email = attributes.find((attr: any) => attr.Name === 'email')?.Value;
            } catch (error) {
                console.error('Error fetching user attributes:', error);
            }
        }
    }
    
    if (!email) {
        throw new Error('User email not found. Please log in again.');
    }
    
    return email.toLowerCase();
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

