// @ts-nocheck
import express from 'express';
const router = express.Router();
import resultsService from '../services/ResultsService';
import { authenticateToken } from '../auth/auth.middleware';
import { getUserAttributes } from '../auth/cognito';

/**
 * POST /api/student/submit-assessment
 * Submit assessment result
 */
router.post('/submit-assessment', authenticateToken, async (req, res) => {
    try {
        console.log('=== Submit Assessment Request ===');
        console.log('User:', JSON.stringify(req.user, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('Headers:', req.headers);

        // Try to get email from token first
        // Only use email if it's a valid email address (contains @)
        let studentEmail = (req.user?.email && req.user.email.includes('@')) ? req.user.email : null;

        // Also check username if it contains @
        if (!studentEmail && req.user?.username && req.user.username.includes('@')) {
            studentEmail = req.user.username;
        }

        // If no email in token, get it from Cognito
        if (!studentEmail) {
            const userId = req.user?.username || req.user?.sub;
            if (userId) {
                try {
                    console.log('Fetching email from Cognito for user:', userId);
                    const userInfo = await getUserAttributes(userId);
                    if (userInfo?.attributes?.email) {
                        studentEmail = userInfo.attributes.email;
                        console.log('Got email from Cognito:', studentEmail);
                    }
                } catch (cognitoError) {
                    console.error('Error fetching email from Cognito:', cognitoError);
                }
            }
        }

        console.log('Extracted student email:', studentEmail);

        if (!studentEmail) {
            console.error('Student email not found in token. User object:', req.user);
            return res.status(400).json({
                success: false,
                message: 'Student email not found in token'
            });
        }

        // Ensure the email in the payload matches the authenticated student
        req.body.email = studentEmail;

        // Validate required fields
        if (!req.body.assessmentId) {
            console.error('Assessment ID missing in request body');
            return res.status(400).json({
                success: false,
                message: 'Assessment ID is required'
            });
        }

        console.log('Calling ResultService.saveAssessmentResult with normalized email:', req.body.email);
        // Call ResultService to save the result
        const result = await resultsService.saveAssessmentResult(req.body);

        console.log('Result saved successfully:', result);
        res.status(200).json({
            success: true,
            message: 'Assessment submitted successfully',
            data: result
        });
    } catch (error: any) {
        console.error('Error submitting assessment:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Full error:', JSON.stringify(error, null, 2));

        // Provide user-friendly error message
        let errorMessage = error.message || 'Failed to submit assessment';

        // If it's a table not found error, provide helpful message
        if (error.message && error.message.includes('does not exist')) {
            errorMessage = `Database table not found. Please create the table "${process.env.RESULTS_TABLE_NAME || 'Assessment_placipy_asseessment_result'}" in DynamoDB with PK (String) and SK (String) as keys.`;
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * GET /api/student/results
 * Get all results for logged-in student
 */
router.get('/results', authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Student Results Request ===');
        console.log('User:', req.user);
        console.log('Request URL:', req.url);
        console.log('Request method:', req.method);

        // Try to get email from token first
        let studentEmail = req.user?.email ||
            (req.user?.username && req.user.username.includes('@') ? req.user.username : null) ||
            (req.user?.sub && req.user.sub.includes('@') ? req.user.sub : null);

        // If no email in token, get it from Cognito
        if (!studentEmail) {
            const userId = req.user?.username || req.user?.sub;
            if (userId) {
                try {
                    console.log('Fetching email from Cognito for user:', userId);
                    const userInfo = await getUserAttributes(userId);
                    if (userInfo?.attributes?.email) {
                        studentEmail = userInfo.attributes.email;
                        console.log('Got email from Cognito:', studentEmail);
                    }
                } catch (cognitoError) {
                    console.error('Error fetching email from Cognito:', cognitoError);
                }
            }
        }

        if (!studentEmail) {
            return res.status(400).json({
                success: false,
                message: 'Student email not found in token or Cognito'
            });
        }

        console.log('Fetching results for student email:', studentEmail);
        const results = await resultsService.getStudentResults(studentEmail);
        console.log('Found results:', results.length);

        // Always return success with data array (even if empty)
        res.status(200).json({
            success: true,
            data: results || []
        });
    } catch (error: any) {
        console.error('Error getting student results:', error);
        console.error('Error stack:', error.stack);

        // Return empty array on error instead of failing
        res.status(200).json({
            success: true,
            data: []
        });
    }
});

/**
 * GET /api/student/results/:attemptId
 * Get detailed result for a specific attempt
 */
router.get('/results/:attemptId', authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Result Detail Request ===');
        console.log('User:', req.user);
        console.log('Attempt ID:', req.params.attemptId);

        // Try to get email from token first
        let studentEmail = req.user?.email ||
            (req.user?.username && req.user.username.includes('@') ? req.user.username : null) ||
            (req.user?.sub && req.user.sub.includes('@') ? req.user.sub : null);

        // If no email in token, get it from Cognito
        if (!studentEmail) {
            const userId = req.user?.username || req.user?.sub;
            if (userId) {
                try {
                    console.log('Fetching email from Cognito for user:', userId);
                    const userInfo = await getUserAttributes(userId);
                    if (userInfo?.attributes?.email) {
                        studentEmail = userInfo.attributes.email;
                        console.log('Got email from Cognito:', studentEmail);
                    }
                } catch (cognitoError) {
                    console.error('Error fetching email from Cognito:', cognitoError);
                }
            }
        }

        const { attemptId } = req.params;

        if (!studentEmail) {
            return res.status(400).json({
                success: false,
                message: 'Student email not found in token or Cognito'
            });
        }

        if (!attemptId) {
            return res.status(400).json({
                success: false,
                message: 'Attempt ID is required'
            });
        }

        // Decode the attemptId (it's URL encoded SK)
        const decodedAttemptId = decodeURIComponent(attemptId);
        console.log('Decoded attempt ID:', decodedAttemptId);
        console.log('Using student email:', studentEmail);

        const result = await resultsService.getResultByAttemptId(studentEmail, decodedAttemptId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error getting result detail:', error);

        if (error.message && (error.message.includes('not found') || error.message.includes('does not belong'))) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve result'
        });
    }
});

/**
 * GET /api/student/dashboard-stats
 * Get dashboard statistics for logged-in student
 */
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
    try {
        console.log('=== Get Dashboard Stats Request ===');
        console.log('User:', req.user);

        // Try to get email from token first
        let studentEmail = req.user?.email ||
            (req.user?.username && req.user.username.includes('@') ? req.user.username : null) ||
            (req.user?.sub && req.user.sub.includes('@') ? req.user.sub : null);

        // If no email in token, get it from Cognito
        if (!studentEmail) {
            const userId = req.user?.username || req.user?.sub;
            if (userId) {
                try {
                    console.log('Fetching email from Cognito for user:', userId);
                    const userInfo = await getUserAttributes(userId);
                    if (userInfo?.attributes?.email) {
                        studentEmail = userInfo.attributes.email;
                        console.log('Got email from Cognito:', studentEmail);
                    }
                } catch (cognitoError) {
                    console.error('Error fetching email from Cognito:', cognitoError);
                }
            }
        }

        if (!studentEmail) {
            return res.status(400).json({
                success: false,
                message: 'Student email not found in token or Cognito'
            });
        }

        console.log('Fetching dashboard stats for student email:', studentEmail);

        // Get student's results
        const results = await resultsService.getStudentResults(studentEmail);
        console.log('Found results:', results.length);

        // Calculate statistics
        const completedCount = results.length;
        const averageScore = results.length > 0
            ? Math.round(results.reduce((sum: number, r: any) => sum + (r.percentage || 0), 0) / results.length)
            : 0;

        // Get recent assessments (last 5, sorted by submittedAt)
        const recentResults = results
            .sort((a: any, b: any) => {
                const dateA = new Date(a.submittedAt || 0).getTime();
                const dateB = new Date(b.submittedAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 5)
            .map((result: any) => ({
                assessmentId: result.assessmentId,
                title: result.assessmentId, // Will be replaced with actual title from assessment
                status: 'completed',
                progress: result.percentage || 0,
                score: result.score || 0,
                maxScore: result.maxScore || 0,
                percentage: result.percentage || 0,
                submittedAt: result.submittedAt
            }));

        // Performance data by assessment (student's performance in each assessment)
        // Sort by submittedAt (most recent first) and take top 10
        const performanceByAssessment = results
            .sort((a: any, b: any) => {
                const dateA = new Date(a.submittedAt || 0).getTime();
                const dateB = new Date(b.submittedAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 10) // Show top 10 most recent assessments
            .map((result: any) => ({
                assessmentId: result.assessmentId,
                subject: result.assessmentId, // Will be replaced with title in frontend if available
                score: result.percentage || 0,
                submittedAt: result.submittedAt
            }));

        const performanceData = performanceByAssessment;

        res.status(200).json({
            success: true,
            data: {
                completedTests: completedCount,
                averageScore: averageScore,
                ranking: null, // Ranking would require comparing with all students
                recentAssessments: recentResults,
                performanceData: performanceData
            }
        });
    } catch (error: any) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve dashboard statistics'
        });
    }
});

export default router;

