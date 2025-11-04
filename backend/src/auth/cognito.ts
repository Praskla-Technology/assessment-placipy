// @ts-nocheck
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const crypto = require('crypto');
const {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand, // Add this for handling challenges
    AdminAddUserToGroupCommand,
    AdminListGroupsForUserCommand,
    AdminGetUserCommand  // Add this for getting user attributes
} = require("@aws-sdk/client-cognito-identity-provider");
const { fromEnv } = require("@aws-sdk/credential-providers");

// Configure AWS Cognito client with proper error handling
let cognitoClient;

function initializeCognitoClient() {
    try {
        const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
        console.log('Initializing Cognito client with region:', region);

        cognitoClient = new CognitoIdentityProviderClient({
            region: region,
            credentials: fromEnv()
        });

        console.log('Cognito client initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Cognito client:', error);
        return false;
    }
}

// Initialize the client
initializeCognitoClient();

/**
 * Calculates the SECRET_HASH required for Cognito authentication
 * @param {string} username 
 * @param {string} clientId 
 * @param {string} clientSecret 
 * @returns {string} Base64 encoded HMAC-SHA256 hash
 */
function calculateSecretHash(username, clientId, clientSecret) {
    return crypto
        .createHmac('sha256', clientSecret)
        .update(username + clientId)
        .digest('base64');
}

/**
 * Registers a new user in Cognito User Pool
 * @param username 
 * @param password 
 * @param email 
 * @returns 
 */
const cognitoRegisterUser = async (username, password, email) => {
    if (!cognitoClient) {
        console.error('Cognito client not initialized');
        throw new Error('Cognito service not available');
    }

    try {
        console.log('Attempting to register user:', username);

        // Prepare parameters
        const params = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: username,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        // Add SECRET_HASH if client secret is configured
        if (process.env.COGNITO_CLIENT_SECRET) {
            const secretHash = calculateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET);
            params.SecretHash = secretHash;
        }

        const command = new SignUpCommand(params);

        const result = await cognitoClient.send(command);
        console.log('User registration result:', result);
        return result.UserSub ? { Username: username } : null;
    } catch (error) {
        console.error('Error registering user:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.Code);
        throw new Error('User registration failed: ' + error.message);
    }
};

/**
 * Authenticates a user with Cognito User Pool using USER_PASSWORD_AUTH flow
 * Handles NEW_PASSWORD_REQUIRED challenge
 * @param username 
 * @param password 
 * @param newPassword (optional) - for handling NEW_PASSWORD_REQUIRED challenge
 * @param session (optional) - for handling NEW_PASSWORD_REQUIRED challenge
 * @returns 
 */
const cognitoLoginUser = async (username, password, newPassword = null, session = null) => {
    if (!cognitoClient) {
        console.error('Cognito client not initialized');
        throw new Error('Cognito service not available');
    }

    try {
        // If we have a session and newPassword, respond to the challenge
        if (session && newPassword) {
            console.log('Responding to NEW_PASSWORD_REQUIRED challenge for user:', username);

            const challengeResponses = {
                USERNAME: username,
                NEW_PASSWORD: newPassword
            };

            // Add SECRET_HASH if client secret is configured
            if (process.env.COGNITO_CLIENT_SECRET) {
                const secretHash = calculateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET);
                challengeResponses.SECRET_HASH = secretHash;
            }

            const command = new RespondToAuthChallengeCommand({
                ClientId: process.env.COGNITO_CLIENT_ID,
                ChallengeName: 'NEW_PASSWORD_REQUIRED',
                Session: session,
                ChallengeResponses: challengeResponses
            });

            const result = await cognitoClient.send(command);
            console.log('Challenge response result:', JSON.stringify(result, null, 2));

            if (result.AuthenticationResult) {
                console.log('Authentication successful after challenge response');
                return result.AuthenticationResult;
            } else {
                console.log('Authentication failed after challenge response');
                return null;
            }
        }

        // Regular authentication flow
        console.log('Attempting to authenticate user with USER_PASSWORD_AUTH:', username);
        console.log('Using ClientId:', process.env.COGNITO_CLIENT_ID);
        console.log('Using Region:', process.env.COGNITO_REGION || process.env.AWS_REGION);

        // Prepare auth parameters
        const authParameters = {
            USERNAME: username,
            PASSWORD: password
        };

        // Add SECRET_HASH if client secret is configured
        if (process.env.COGNITO_CLIENT_SECRET) {
            const secretHash = calculateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET);
            authParameters.SECRET_HASH = secretHash;
            console.log('Added SECRET_HASH to auth parameters');
        }

        console.log('Auth parameters:', JSON.stringify(authParameters, null, 2));

        // Using InitiateAuthCommand with USER_PASSWORD_AUTH flow
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: authParameters
        });

        console.log('Sending authentication request to Cognito...');
        const result = await cognitoClient.send(command);
        console.log('Full authentication result:', JSON.stringify(result, null, 2));

        // Check if we have a challenge
        if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            console.log('NEW_PASSWORD_REQUIRED challenge received');
            // Return the challenge information so the client can handle it
            return {
                challenge: 'NEW_PASSWORD_REQUIRED',
                session: result.Session,
                challengeParameters: result.ChallengeParameters
            };
        }

        if (result.AuthenticationResult) {
            console.log('Authentication successful');
            return result.AuthenticationResult;
        } else {
            console.log('Authentication failed - no AuthenticationResult in response');
            return null;
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.Code);
        console.error('Error stack:', error.stack);

        // Check if it's a resource not found error
        if (error.name === 'ResourceNotFoundException') {
            console.error('The user pool or client ID may be incorrect. Please verify your configuration.');
            console.error('Make sure the following resources exist in your AWS account:');
            console.error('- User Pool ID:', process.env.COGNITO_USER_POOL_ID);
            console.error('- Client ID:', process.env.COGNITO_CLIENT_ID);
        }

        // Handle specific authentication errors
        if (error.name === 'NotAuthorizedException') {
            console.error('Not authorized - check username and password');
        }

        if (error.name === 'UserNotFoundException') {
            console.error('User not found in the user pool');
        }

        if (error.name === 'InvalidPasswordException') {
            console.error('Invalid password - check password requirements');
        }

        if (error.name === 'PasswordResetRequiredException') {
            console.error('Password reset required for this user');
        }

        throw new Error('Invalid credentials: ' + error.message);
    }
};

/**
 * Validates a JWT token using Cognito JWKs
 * @param token 
 * @returns 
 */
const cognitoValidateToken = async (token) => {
    try {
        // Decode the token to get the header
        const decodedHeader = jwt.decode(token, { complete: true });

        if (!decodedHeader) {
            throw new Error('Invalid token');
        }

        // Get the JWKs from Cognito
        const region = process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1';
        const userPoolId = process.env.COGNITO_USER_POOL_ID;
        const jwksUrl = process.env.COGNITO_JWKS_URL ||
            `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

        console.log('Fetching JWKs from:', jwksUrl);
        const response = await axios.get(jwksUrl);
        const jwks = response.data;

        // Find the key that matches the token's kid
        const key = jwks.keys.find(function (k) { return k.kid === decodedHeader.header.kid; });

        if (!key) {
            throw new Error('Key not found');
        }

        // Convert JWK to PEM
        const pem = jwkToPem(key);

        // Verify the token
        const decoded = jwt.verify(token, pem, { algorithms: ['RS256'] });

        // Check if token is expired
        if (decoded.exp < Date.now() / 1000) {
            throw new Error('Token expired');
        }

        return decoded;
    } catch (error) {
        console.error('Error validating token:', error);
        return null;
    }
};

/**
 * Adds a user to a Cognito group
 * @param username 
 * @param groupName 
 * @returns 
 */
const cognitoAddUserToGroup = async (username, groupName) => {
    if (!cognitoClient) {
        console.error('Cognito client not initialized');
        throw new Error('Cognito service not available');
    }

    try {
        console.log('Adding user to group:', { username, groupName });

        // Prepare parameters
        const params = {
            GroupName: groupName,
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: username
        };

        // Add SECRET_HASH if client secret is configured
        if (process.env.COGNITO_CLIENT_SECRET) {
            const secretHash = calculateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET);
            params.SecretHash = secretHash;
        }

        const command = new AdminAddUserToGroupCommand(params);

        await cognitoClient.send(command);
        return true;
    } catch (error) {
        console.error('Error adding user to group:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        throw new Error('Failed to add user to group: ' + error.message);
    }
};

/**
 * Gets user groups from Cognito
 * @param username 
 * @returns 
 */
const cognitoGetUserGroups = async (username) => {
    if (!cognitoClient) {
        console.error('Cognito client not initialized');
        throw new Error('Cognito service not available');
    }

    try {
        console.log('Getting user groups for:', username);

        // Prepare parameters
        const params = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: username
        };

        // Add SECRET_HASH if client secret is configured
        if (process.env.COGNITO_CLIENT_SECRET) {
            const secretHash = calculateSecretHash(username, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET);
            params.SecretHash = secretHash;
        }

        const command = new AdminListGroupsForUserCommand(params);

        const result = await cognitoClient.send(command);
        return result.Groups?.map(function (group) { return group.GroupName; }) || [];
    } catch (error) {
        console.error('Error getting user groups:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        throw new Error('Failed to retrieve user groups: ' + error.message);
    }
};

/**
 * Gets user attributes from Cognito by username/sub
 * @param username 
 * @returns 
 */
const cognitoGetUserAttributes = async (username) => {
    if (!cognitoClient) {
        console.error('Cognito client not initialized');
        throw new Error('Cognito service not available');
    }

    try {
        console.log('Getting user attributes for:', username);

        // Prepare parameters
        const params = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: username
        };

        const command = new AdminGetUserCommand(params);

        const result = await cognitoClient.send(command);

        // Convert attributes array to object
        const attributes = {};
        if (result.UserAttributes) {
            result.UserAttributes.forEach(attr => {
                attributes[attr.Name] = attr.Value;
            });
        }

        return {
            username: result.Username,
            attributes: attributes,
            enabled: result.Enabled,
            userStatus: result.UserStatus
        };
    } catch (error) {
        console.error('Error getting user attributes:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        throw new Error('Failed to retrieve user attributes: ' + error.message);
    }
};

module.exports = {
    registerUser: cognitoRegisterUser,
    loginUser: cognitoLoginUser,
    validateToken: cognitoValidateToken,
    addUserToGroup: cognitoAddUserToGroup,
    getUserGroups: cognitoGetUserGroups,
    getUserAttributes: cognitoGetUserAttributes  // Export the new function
};