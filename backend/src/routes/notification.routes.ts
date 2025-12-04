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
 * Returns recent published assessments for the student's department as notifications
 */
router.get('/', authMiddleware.authenticateToken, async (req, res) => {
    try {
        const email = await getEmailFromRequest(req);
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
        const lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey as string) : null;

        // Get stored notifications from DB
        const storedNotifications = await notificationService.getNotificationsForUser(email, limit, lastKey);
        
        // Get student's department from Cognito
        const userId = req.user['cognito:username'] || req.user.username || req.user.sub;
        let studentDepartment = null;
        
        try {
            const userInfo = await getUserAttributes(userId);
            console.log('User attributes for notifications:', userInfo?.attributes);
            studentDepartment = userInfo?.attributes?.department || 
                               userInfo?.attributes?.['custom:department'] ||
                               req.user?.department ||
                               req.user?.['custom:department'];
            console.log('Student department:', studentDepartment);
        } catch (err) {
            console.error('Error getting user department:', err);
        }
        
        // Get recent published assessments for this department
        const assessmentNotifications = [];
        const assessmentService = require('../services/AssessmentService');
        const domain = email.split('@')[1] || 'ksrce.ac.in';
        
        // Get all published assessments
        const assessments = await assessmentService.getAllAssessments({ 
            clientDomain: domain,
            status: 'ACTIVE'
        });
        
        console.log(`Found ${assessments.items?.length || 0} assessments`);
        
        // Filter assessments published in last 30 days (increased from 7)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        for (const assessment of assessments.items || []) {
            console.log(`Checking assessment: ${assessment.title}, isPublished: ${assessment.isPublished}, dept: ${assessment.department}`);
            
            if (!assessment.isPublished) {
                console.log(`  Skipped (not published)`);
                continue;
            }
            
            const createdAt = new Date(assessment.createdAt);
            if (createdAt < thirtyDaysAgo) {
                console.log(`  Skipped (too old)`);
                continue;
            }
            
            // Check if assessment is for this student's department
            const targetDepts = assessment.target?.departments || [];
            const assessmentDept = assessment.department || 'All Departments';
            
            console.log(`  Assessment dept: ${assessmentDept}, Student dept: ${studentDepartment}, Target depts: ${targetDepts.join(', ')}`);
            
            const isForStudent = 
                assessmentDept === 'All Departments' ||
                (studentDepartment && assessmentDept === studentDepartment) ||
                (studentDepartment && targetDepts.includes(studentDepartment)) ||
                targetDepts.length === 0;
            
            console.log(`  Match result: ${isForStudent}`);
            
            if (isForStudent) {
                assessmentNotifications.push({
                    SK: `NOTIF#${assessment.assessmentId}#${createdAt.getTime()}`,
                    type: 'assessment_published',
                    title: `New Assessment: ${assessment.title}`,
                    message: assessment.scheduling?.startDate 
                        ? `A new assessment "${assessment.title}" has been published and is scheduled.`
                        : `A new assessment "${assessment.title}" has been published.`,
                    link: `/student/assessments/${assessment.assessmentId}`,
                    priority: 'medium',
                    isRead: false,
                    createdAt: assessment.createdAt,
                    metadata: { assessmentId: assessment.assessmentId }
                });
                console.log(`  ✅ Added to notifications`);
            }
        }
        
        console.log(`Total assessment notifications: ${assessmentNotifications.length}`);
        
        // Combine stored and assessment notifications
        const allNotifications = [...assessmentNotifications, ...storedNotifications.items];
        
        // Sort by createdAt (newest first)
        allNotifications.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
        
        res.status(200).json({
            success: true,
            data: allNotifications.slice(0, limit),
            lastKey: storedNotifications.lastKey
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

