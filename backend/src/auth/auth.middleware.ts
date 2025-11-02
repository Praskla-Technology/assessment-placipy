// @ts-nocheck
const { validateToken } = require('./cognito');

/**
 * Middleware to authenticate JWT tokens
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access token required'
            });
        }

        // Validate token
        const decoded = await validateToken(token);

        if (!decoded) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid or expired token'
            });
        }

        // Log token information for debugging
        console.log('Token decoded successfully. Token contents:', JSON.stringify(decoded, null, 2));

        // Attach user information to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Middleware to authorize user roles
 * @param roles 
 * @returns 
 */
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }

            // Get user groups from token
            const userGroups = req.user['cognito:groups'] || [];

            // Check if user has any of the required roles
            const hasRole = roles.some(role => userGroups.includes(role));

            if (!hasRole) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authorization failed'
            });
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};