// @ts-nocheck
const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const AWS = require('aws-sdk');
const resultsService = require('../services/ResultsService');
const { getUserAttributes } = require('../auth/cognito');

const router = express.Router();
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy';

/**
 * Helper function to get user email from Cognito profile
 * Always fetches the actual email from the user's profile
 */
async function getEmailFromRequest(req) {
    // Get user ID from JWT token
    const userId = req.user?.['cognito:username'] || req.user?.username || req.user?.sub;
    
    console.log('Extracted user ID from token:', userId);
    
    if (!userId) {
        // Fallback: try to get email directly from token
        const email = req.user?.email || req.user?.['cognito:email'];
        if (email) {
            console.log('Using email from token directly:', email);
            return email.toLowerCase();
        }
        throw new Error('User ID not found in authentication token');
    }
    
    try {
        console.log('Fetching email from Cognito profile for user ID:', userId);
        // Always fetch email from Cognito profile to ensure accuracy
        const userInfo = await getUserAttributes(userId);
        const email = userInfo?.attributes?.email;
        
        if (!email) {
            // Fallback: try to get email from token if not in profile
            const tokenEmail = req.user?.email || req.user?.['cognito:email'];
            if (tokenEmail) {
                console.log('Using email from token as fallback:', tokenEmail);
                return tokenEmail.toLowerCase();
            }
            throw new Error('Email not found in user profile');
        }
        
        console.log('Got email from Cognito profile:', email);
        return email.toLowerCase();
    } catch (error) {
        console.error('Error fetching email from Cognito profile:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback: try to get email from token
        const tokenEmail = req.user?.email || req.user?.['cognito:email'];
        if (tokenEmail) {
            console.log('Using email from token as final fallback:', tokenEmail);
            return tokenEmail.toLowerCase();
        }
        
        throw new Error('Failed to fetch user email from profile: ' + error.message);
    }
}

// Get student analytics
router.get('/students', authMiddleware.authenticateToken, async (req, res) => {
    try {
        // Scan for all students
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'begins_with(SK, :student)',
            ExpressionAttributeValues: {
                ':student': 'STUDENT#'
            }
        };

        const result = await dynamodb.scan(params).promise();
        const students = result.Items || [];

        // Count by department
        const departmentCount = students.reduce((acc: any, student: any) => {
            const dept = student.department || 'Unknown';
            acc[dept] = (acc[dept] || 0) + 1;
            return acc;
        }, {});

        // Count by status
        const activeCount = students.filter((s: any) => s.status === 'Active').length;

        res.json({
            success: true,
            data: {
                totalStudents: students.length,
                activeStudents: activeCount,
                departmentCounts: departmentCount,
                students: students.slice(0, 100) // Limit to 100 for performance
            }
        });
    } catch (error) {
        console.error('Error getting student analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve student analytics',
            error: error.message
        });
    }
});

// Get department statistics
router.get('/departments', authMiddleware.authenticateToken, async (req, res) => {
    try {
        // Get all students
        const studentsParams = {
            TableName: TABLE_NAME,
            FilterExpression: 'begins_with(SK, :student)',
            ExpressionAttributeValues: {
                ':student': 'STUDENT#'
            }
        };

        const studentsResult = await dynamodb.scan(studentsParams).promise();
        const students = studentsResult.Items || [];

        // Group by department
        const deptStats = students.reduce((acc: any, student: any) => {
            const dept = student.department || 'Unknown';
            if (!acc[dept]) {
                acc[dept] = {
                    department: dept,
                    totalStudents: 0,
                    activeStudents: 0
                };
            }
            acc[dept].totalStudents++;
            if (student.status === 'Active') {
                acc[dept].activeStudents++;
            }
            return acc;
        }, {});

        const departmentStats = Object.values(deptStats);

        res.json({
            success: true,
            data: departmentStats
        });
    } catch (error) {
        console.error('Error getting department stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve department statistics',
            error: error.message
        });
    }
});

// Get assessment analytics
router.get('/assessments', authMiddleware.authenticateToken, async (req, res) => {
    try {
        // Get all assessments
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'SK = :metadata',
            ExpressionAttributeValues: {
                ':metadata': 'METADATA'
            }
        };

        const result = await dynamodb.scan(params).promise();
        const assessments = result.Items || [];

        // Filter only assessment items (PK starts with ASSESSMENT#)
        const assessmentData = assessments.filter((item: any) => 
            item.PK && item.PK.startsWith('ASSESSMENT#')
        );

        res.json({
            success: true,
            data: {
                totalAssessments: assessmentData.length,
                assessments: assessmentData
            }
        });
    } catch (error) {
        console.error('Error getting assessment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve assessment analytics',
            error: error.message
        });
    }
});

// Get comprehensive analytics data for PTS dashboard
router.get('/pts-overview', authMiddleware.authenticateToken, async (req, res) => {
    try {
        console.log('=== Getting PTS Overview Analytics ===');
        console.log('Request object:', JSON.stringify(req.user, null, 2));
        
        // Get requester email for domain-based filtering
        const requesterEmail = await getEmailFromRequest(req);
        console.log('Requester email:', requesterEmail);
        
        // Validate email format
        if (!requesterEmail || !requesterEmail.includes('@')) {
            throw new Error('Invalid email format: ' + requesterEmail);
        }
        
        // Use the results service to get PTS overview data, passing the requester's domain
        const ptsOverview = await resultsService.getPTSOverview(requesterEmail);
        
        res.json({
            success: true,
            data: ptsOverview
        });
    } catch (error) {
        console.error('Error getting PTS overview analytics:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve PTS overview analytics',
            error: error.message
        });
    }
});

module.exports = router;