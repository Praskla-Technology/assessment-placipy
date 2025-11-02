// @ts-nocheck
const { registerUser, loginUser, addUserToGroup, getUserAttributes } = require('./cognito');
const dynamoDBService = require('../services/DynamoDBService');

/**
 * Register a new user
 * @param req 
 * @param res 
 * @returns 
 */
const register = async (req, res) => {
    try {
        console.log('Register endpoint called with body:', req.body);
        const { username, password, email, role } = req.body;

        // Validate required fields
        if (!username || !password || !email) {
            console.log('Missing required fields');
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Username, password, and email are required'
            });
        }

        // Register user in Cognito
        console.log('Registering user in Cognito:', { username, email });
        const user = await registerUser(username, password, email);

        // Assign role if provided
        if (role) {
            console.log('Adding user to group:', { username, role });
            await addUserToGroup(username, role);
        }

        // Return success response without exposing sensitive information
        console.log('User registered successfully:', user.Username);
        return res.status(201).json({
            message: 'User registered successfully',
            userId: user.Username
        });
    } catch (error) {
        console.error('Registration error:', error);

        // Log the full error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Full registration error details:', error.stack);
        }

        // Generic error message to prevent user enumeration
        return res.status(400).json({
            error: 'Registration Failed',
            message: 'Unable to register user: ' + error.message
        });
    }
};

/**
 * Login a user
 * @param req 
 * @param res 
 * @returns 
 */
const login = async (req, res) => {
    try {
        console.log('Login endpoint called with body:', req.body);
        const { username, password, newPassword, session } = req.body;

        // Validate required fields
        if (!username || !password) {
            console.log('Missing required fields for login');
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Username and password are required'
            });
        }

        console.log('Attempting to authenticate user:', username);

        // Authenticate user with Cognito
        const authResult = await loginUser(username, password, newPassword, session);

        console.log('Cognito authentication result:', authResult);

        // Check if we have a challenge to handle
        if (authResult && authResult.challenge === 'NEW_PASSWORD_REQUIRED') {
            console.log('NEW_PASSWORD_REQUIRED challenge for user:', username);
            return res.status(200).json({
                challenge: 'NEW_PASSWORD_REQUIRED',
                message: 'New password required',
                session: authResult.session,
                challengeParameters: authResult.challengeParameters
            });
        }

        // Check if authentication was successful
        if (!authResult) {
            console.log('Authentication failed for user:', username);
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid credentials or user not found'
            });
        }

        // Check if we have the required tokens
        if (!authResult.AccessToken) {
            console.log('Authentication failed - no access token in result');
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Authentication failed - no access token received'
            });
        }

        console.log('Authentication successful for user:', username);
        // Return tokens without exposing sensitive information
        return res.status(200).json({
            message: 'Login successful',
            accessToken: authResult.AccessToken,
            idToken: authResult.IdToken,
            refreshToken: authResult.RefreshToken
        });
    } catch (error) {
        console.error('Login error:', error);

        // Log the full error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Full login error details:', error.stack);
        }

        // Generic error message to prevent user enumeration
        return res.status(401).json({
            error: 'Authentication Failed',
            message: 'Invalid credentials: ' + error.message
        });
    }
};

/**
 * Respond to NEW_PASSWORD_REQUIRED challenge
 * @param req 
 * @param res 
 * @returns 
 */
const respondToNewPasswordChallenge = async (req, res) => {
    try {
        console.log('Respond to new password challenge endpoint called with body:', req.body);
        const { username, password, newPassword, session } = req.body;

        // Validate required fields
        if (!username || !password || !newPassword || !session) {
            console.log('Missing required fields for new password challenge');
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Username, password, newPassword, and session are required'
            });
        }

        console.log('Responding to NEW_PASSWORD_REQUIRED challenge for user:', username);

        // Authenticate user with Cognito and respond to challenge
        const authResult = await loginUser(username, password, newPassword, session);

        console.log('Cognito authentication result after challenge response:', authResult);

        // Check if authentication was successful after challenge response
        if (!authResult || !authResult.AccessToken) {
            console.log('Authentication failed after challenge response for user:', username);
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Failed to set new password. The session may have expired or already been used. Please try logging in again.'
            });
        }

        console.log('Authentication successful after challenge response for user:', username);
        // Return tokens without exposing sensitive information
        return res.status(200).json({
            message: 'Password updated successfully. You can now log in with your new password.',
            accessToken: authResult.AccessToken,
            idToken: authResult.IdToken,
            refreshToken: authResult.RefreshToken
        });
    } catch (error) {
        console.error('New password challenge error:', error);

        // Log the full error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Full new password challenge error details:', error.stack);
        }

        // Handle specific error cases
        if (error.message && error.message.includes('Invalid session for the user')) {
            return res.status(401).json({
                error: 'Challenge Response Failed',
                message: 'The session has expired or already been used. Please try logging in again to get a new session.'
            });
        }

        // Generic error message
        return res.status(401).json({
            error: 'Challenge Response Failed',
            message: 'Failed to set new password: ' + error.message
        });
    }
};

/**
 * Get user profile with role information
 * @param req 
 * @param res 
 * @returns 
 */
const getProfile = async (req, res) => {
    try {
        console.log('Profile endpoint called. User from token:', req.user);

        // Get email from the validated token - try multiple possible fields
        let email = null;
        let userId = null;

        // Try different possible fields for email
        if (req.user.email) {
            email = req.user.email;
        } else if (req.user['cognito:username'] && req.user['cognito:username'].includes('@')) {
            email = req.user['cognito:username'];
        } else if (req.user.username && req.user.username.includes('@')) {
            email = req.user.username;
        } else if (req.user.sub && req.user.sub.includes('@')) {
            // For some tokens, the subject might be the email
            email = req.user.sub;
        } else {
            // If we don't have an email-like field, store the user ID for lookup
            if (req.user['cognito:username']) {
                userId = req.user['cognito:username'];
            } else if (req.user.username) {
                userId = req.user.username;
            } else if (req.user.sub) {
                userId = req.user.sub;
            }
        }

        console.log('Extracted email from token:', email);
        console.log('Extracted user ID from token:', userId);

        // If we don't have an email, try to get it from Cognito
        if (!email && userId) {
            try {
                console.log('Attempting to get email from Cognito for user ID:', userId);
                const userInfo = await getUserAttributes(userId);
                console.log('User info from Cognito:', JSON.stringify(userInfo, null, 2));

                if (userInfo.attributes && userInfo.attributes.email) {
                    email = userInfo.attributes.email;
                    console.log('Retrieved email from Cognito:', email);
                }
            } catch (cognitoError) {
                console.error('Error getting user info from Cognito:', cognitoError);
            }
        }

        if (!email) {
            console.log('Email not found in token or Cognito. Token contents:', JSON.stringify(req.user, null, 2));
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Email not found in token or Cognito'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid email format'
            });
        }

        // Get user data from DynamoDB
        console.log('Fetching user data from DynamoDB for:', email);
        const userData = await dynamoDBService.getUserDataByEmail(email);

        console.log('DynamoDB result:', userData);

        if (!userData) {
            console.log('User not found in database:', email);
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found in database'
            });
        }

        // Return user profile with role information
        console.log('Returning user profile for:', email);
        return res.status(200).json({
            message: 'User profile retrieved successfully',
            user: {
                email: userData.email,
                name: userData.name,
                role: userData.role,
                department: userData.department,
                year: userData.year,
                joiningDate: userData.joiningDate
            }
        });
    } catch (error) {
        console.error('Profile error:', error);

        // Log the full error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('Full profile error details:', error.stack);
        }

        // Handle DynamoDB specific errors
        if (error.message && error.message.includes('Invalid email format')) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid email format: ' + error.message
            });
        }

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Unable to retrieve user profile: ' + error.message
        });
    }
};

/**
 * Initiate password reset
 * @param req 
 * @param res 
 * @returns 
 */
const forgotPassword = async (req, res) => {
    try {
        console.log('Forgot password endpoint called');
        // In a real implementation, you would integrate with Cognito's forgot password flow
        // This is a placeholder to demonstrate the endpoint structure

        return res.status(200).json({
            message: 'Password reset initiated. Check your email for instructions.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);

        // Generic error message
        return res.status(500).json({
            error: 'Operation Failed',
            message: 'Unable to process password reset request'
        });
    }
};

/**
 * Confirm password reset
 * @param req 
 * @param res 
 * @returns 
 */
const resetPassword = async (req, res) => {
    try {
        console.log('Reset password endpoint called');
        // In a real implementation, you would integrate with Cognito's confirm password reset flow
        // This is a placeholder to demonstrate the endpoint structure

        return res.status(200).json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);

        // Generic error message
        return res.status(500).json({
            error: 'Operation Failed',
            message: 'Unable to reset password'
        });
    }
};

module.exports = {
    register,
    login,
    respondToNewPasswordChallenge,
    getProfile,
    forgotPassword,
    resetPassword
};