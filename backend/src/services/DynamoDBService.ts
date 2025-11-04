// @ts-nocheck
const AWS = require('aws-sdk');

// Configure AWS DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

class DynamoDBService {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    /**
     * Get user by email from DynamoDB based on your specific table structure
     * @param email User's email
     * @returns User data or null if not found
     */
    async getUserByEmail(email: string): Promise<any | null> {
        try {
            console.log(`Looking up user with email: ${email}`);

            // Extract domain from email
            const domain = email.split('@')[1];
            if (!domain) {
                throw new Error('Invalid email format');
            }

            console.log(`Extracted domain: ${domain}`);

            // For admin users, check the special GLOBAL#ADMIN PK first
            if (email === 'admin@praskla.com') {
                console.log('Checking for admin user');
                const adminParams = {
                    TableName: this.tableName,
                    Key: {
                        PK: 'GLOBAL#ADMIN',
                        SK: `ADMIN#${email}`
                    }
                };

                const adminResult = await dynamodb.get(adminParams).promise();
                if (adminResult.Item) {
                    console.log('Found admin user:', adminResult.Item);
                    return adminResult.Item;
                } else {
                    console.log('Admin user not found');
                }
            }

            // For regular users, use CLIENT#{domain} as PK
            const clientPK = `CLIENT#${domain}`;
            console.log(`Using PK: ${clientPK}`);

            // Try to find the user with different role patterns
            const roles = [
                { prefix: 'STUDENT', identifier: email },
                { prefix: 'PTO', identifier: email },
                { prefix: 'PTS', identifier: email }
            ];

            for (const role of roles) {
                const params = {
                    TableName: this.tableName,
                    Key: {
                        PK: clientPK,
                        SK: `${role.prefix}#${role.identifier}`
                    }
                };

                try {
                    console.log(`Checking for ${role.prefix} user with SK: ${role.prefix}#${role.identifier}`);
                    const result = await dynamodb.get(params).promise();
                    if (result.Item) {
                        console.log(`Found ${role.prefix} user:`, result.Item);
                        return result.Item;
                    } else {
                        console.log(`No ${role.prefix} user found with this SK`);
                    }
                } catch (error) {
                    // Continue to next role if this one fails
                    console.log(`Error checking ${role.prefix} user:`, error.message);
                }
            }

            // If not found with exact email, try scanning for email (less efficient but for demo)
            console.log('Trying scan for email');
            const scanParams = {
                TableName: this.tableName,
                FilterExpression: "#email = :email AND begins_with(PK, :clientPrefix)",
                ExpressionAttributeNames: {
                    "#email": "email"
                },
                ExpressionAttributeValues: {
                    ":email": email,
                    ":clientPrefix": "CLIENT#"
                }
            };

            const scanResult = await dynamodb.scan(scanParams).promise();
            if (scanResult.Items && scanResult.Items.length > 0) {
                console.log('Found user via scan:', scanResult.Items[0]);
                return scanResult.Items[0];
            }

            console.log('User not found in DynamoDB');
            return null;
        } catch (error) {
            console.error('Error getting user from DynamoDB:', error.message);
            // If it's a credentials error, provide a more helpful message
            if (error.code === 'CredentialsError' || error.message.includes('credentials')) {
                throw new Error('AWS credentials not configured. Please check your AWS configuration.');
            }
            throw new Error('Failed to retrieve user data from DynamoDB: ' + error.message);
        }
    }

    /**
     * Get user role by email from DynamoDB
     * @param email User's email
     * @returns User role or null if not found
     */
    async getUserRoleByEmail(email: string): Promise<string | null> {
        try {
            console.log(`Getting role for user: ${email}`);
            const user = await this.getUserByEmail(email);
            const role = user ? user.role : null;
            console.log(`Found role: ${role}`);
            return role;
        } catch (error) {
            console.error('Error getting user role from DynamoDB:', error.message);
            throw error;
        }
    }

    /**
     * Get all user data by email from DynamoDB
     * @param email User's email
     * @returns Complete user data or null if not found
     */
    async getUserDataByEmail(email: string): Promise<any | null> {
        try {
            console.log(`Getting data for user: ${email}`);
            const user = await this.getUserByEmail(email);
            console.log(`Found user data:`, user);
            return user;
        } catch (error) {
            console.error('Error getting user data from DynamoDB:', error.message);
            throw error;
        }
    }
}

// Export a singleton instance
module.exports = new DynamoDBService(process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy');