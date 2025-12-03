// @ts-nocheck
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

class NotificationService {
    private notificationsTableName: string;
    private assessmentsTableName: string;
    private studentsTableName: string;

    constructor() {
        // Use the same table as assessments for notifications
        // Or use a dedicated notifications table if you prefer
        this.notificationsTableName = process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy';
        this.assessmentsTableName = process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy';
        this.studentsTableName = process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy';
    }

    /**
     * Extract domain from email address
     */
    private getDomainFromEmail(email: string): string {
        if (!email || !email.includes('@')) {
            return 'ksrce.ac.in'; // Default domain
        }
        return email.split('@')[1];
    }

    /**
     * Create a notification for a single user
     */
    async createNotificationForUser(
        userId: string,
        email: string,
        type: 'assessment_published' | 'result_published' | 'reminder' | 'announcement',
        title: string,
        message: string,
        link: string,
        priority: 'high' | 'medium' | 'low',
        metadata?: any
    ): Promise<any> {
        try {
            const domain = this.getDomainFromEmail(email);
            const PK = `CLIENT#${domain}`;
            const notificationId = uuidv4();
            const SK = `NOTIF#${notificationId}`;
            const createdAt = new Date().toISOString();

            const notification = {
                PK,
                SK,
                userId,
                email: email.toLowerCase(),
                type,
                title,
                message,
                link,
                priority,
                isRead: false,
                createdAt,
                ...(metadata && { metadata })
            };

            const params = {
                TableName: this.notificationsTableName,
                Item: notification
            };

            await dynamodb.put(params).promise();
            console.log(`Notification created: ${SK} for user ${email}`);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('Failed to create notification: ' + error.message);
        }
    }

    /**
     * Create notifications for multiple students
     */
    async createNotificationsForStudents(
        studentEmails: string[],
        type: 'assessment_published' | 'result_published' | 'announcement',
        title: string,
        message: string,
        link: string,
        priority: 'high' | 'medium' | 'low',
        metadata?: any
    ): Promise<any[]> {
        try {
            const notifications = [];
            
            for (const email of studentEmails) {
                const domain = this.getDomainFromEmail(email);
                const PK = `CLIENT#${domain}`;
                
                // Get student info to get userId
                const studentParams = {
                    TableName: this.studentsTableName,
                    KeyConditionExpression: 'PK = :pk AND SK = :sk',
                    ExpressionAttributeValues: {
                        ':pk': PK,
                        ':sk': `STUDENT#${email}`
                    }
                };

                const studentResult = await dynamodb.query(studentParams).promise();
                const student = studentResult.Items?.[0];
                const userId = student?.SK || email;

                const notification = await this.createNotificationForUser(
                    userId,
                    email,
                    type,
                    title,
                    message,
                    link,
                    priority,
                    metadata
                );
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            console.error('Error creating notifications for students:', error);
            throw new Error('Failed to create notifications: ' + error.message);
        }
    }

    /**
     * Get notifications for a user
     */
    async getNotificationsForUser(
        email: string,
        limit: number = 50,
        lastKey?: any
    ): Promise<{ items: any[]; lastKey?: any }> {
        try {
            const domain = this.getDomainFromEmail(email);
            const PK = `CLIENT#${domain}`;

            const params: any = {
                TableName: this.notificationsTableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':skPrefix': 'NOTIF#'
                },
                Limit: limit,
                ScanIndexForward: false // Sort by SK descending (newest first)
            };

            if (lastKey) {
                params.ExclusiveStartKey = lastKey;
            }

            const result = await dynamodb.query(params).promise();
            
            // Filter by email after query (since FilterExpression doesn't work well with KeyConditionExpression)
            const filteredItems = (result.Items || []).filter(
                item => item.email?.toLowerCase() === email.toLowerCase()
            );

            return {
                items: filteredItems,
                lastKey: result.LastEvaluatedKey
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Failed to fetch notifications: ' + error.message);
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, email: string): Promise<any> {
        try {
            const domain = this.getDomainFromEmail(email);
            const PK = `CLIENT#${domain}`;
            const SK = `NOTIF#${notificationId}`;

            const params = {
                TableName: this.notificationsTableName,
                Key: {
                    PK,
                    SK
                },
                UpdateExpression: 'SET isRead = :isRead',
                ExpressionAttributeValues: {
                    ':isRead': true
                },
                ReturnValues: 'ALL_NEW'
            };

            const result = await dynamodb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read: ' + error.message);
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(email: string): Promise<number> {
        try {
            const domain = this.getDomainFromEmail(email);
            const PK = `CLIENT#${domain}`;

            // Get all notifications for this user
            const queryParams = {
                TableName: this.notificationsTableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':skPrefix': 'NOTIF#'
                }
            };

            const result = await dynamodb.query(queryParams).promise();
            const unreadNotifications = (result.Items || []).filter(
                item => item.email?.toLowerCase() === email.toLowerCase() && !item.isRead
            );

            // Update each notification
            let updatedCount = 0;
            for (const notification of unreadNotifications) {
                try {
                    await dynamodb.update({
                        TableName: this.notificationsTableName,
                        Key: {
                            PK: notification.PK,
                            SK: notification.SK
                        },
                        UpdateExpression: 'SET isRead = :isRead',
                        ExpressionAttributeValues: {
                            ':isRead': true
                        }
                    }).promise();
                    updatedCount++;
                } catch (error) {
                    console.error(`Error updating notification ${notification.SK}:`, error);
                }
            }

            return updatedCount;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error('Failed to mark all notifications as read: ' + error.message);
        }
    }

    /**
     * Delete old notifications (older than specified days)
     */
    async deleteOldNotifications(daysOld: number = 60): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const cutoffISO = cutoffDate.toISOString();

            // Note: This is a scan operation which can be expensive
            // In production, consider using a GSI with createdAt as sort key
            const params = {
                TableName: this.notificationsTableName,
                FilterExpression: 'begins_with(SK, :skPrefix) AND createdAt < :cutoffDate',
                ExpressionAttributeValues: {
                    ':skPrefix': 'NOTIF#',
                    ':cutoffDate': cutoffISO
                }
            };

            let deletedCount = 0;
            let lastEvaluatedKey = null;

            do {
                if (lastEvaluatedKey) {
                    params.ExclusiveStartKey = lastEvaluatedKey;
                }

                const result = await dynamodb.scan(params).promise();
                
                // Delete items in batches
                for (const item of result.Items || []) {
                    try {
                        await dynamodb.delete({
                            TableName: this.notificationsTableName,
                            Key: {
                                PK: item.PK,
                                SK: item.SK
                            }
                        }).promise();
                        deletedCount++;
                    } catch (error) {
                        console.error(`Error deleting notification ${item.SK}:`, error);
                    }
                }

                lastEvaluatedKey = result.LastEvaluatedKey;
            } while (lastEvaluatedKey);

            console.log(`Deleted ${deletedCount} old notifications`);
            return deletedCount;
        } catch (error) {
            console.error('Error deleting old notifications:', error);
            throw new Error('Failed to delete old notifications: ' + error.message);
        }
    }



    /**
     * Mark a reminder as sent
     */
    async markReminderAsSent(
        assessmentId: string,
        studentEmail: string,
        reminderType: '24H' | '1H' | '10M'
    ): Promise<void> {
        try {
            const domain = this.getDomainFromEmail(studentEmail);
            const PK = `CLIENT#${domain}`;
            const reminderSK = `NOTIF_SENT#${reminderType}#${assessmentId}#${studentEmail}`;

            const params = {
                TableName: this.notificationsTableName,
                Item: {
                    PK,
                    SK: reminderSK,
                    assessmentId,
                    studentEmail: studentEmail.toLowerCase(),
                    reminderType,
                    sentAt: new Date().toISOString()
                }
            };

            await dynamodb.put(params).promise();
        } catch (error) {
            console.error('Error marking reminder as sent:', error);
            throw new Error('Failed to mark reminder as sent: ' + error.message);
        }
    }

    /**
     * Get all students for a domain (for bulk notifications)
     */
    async getStudentsByDomain(domain: string): Promise<string[]> {
        try {
            const PK = `CLIENT#${domain}`;
            const params = {
                TableName: this.studentsTableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':skPrefix': 'STUDENT#'
                }
            };

            const result = await dynamodb.query(params).promise();
            return (result.Items || []).map(item => item.email).filter(Boolean);
        } catch (error) {
            console.error('Error fetching students by domain:', error);
            throw new Error('Failed to fetch students: ' + error.message);
        }
    }

    /**
     * Get students by department and domain
     */
    async getStudentsByDepartment(domain: string, department: string): Promise<string[]> {
        try {
            const PK = `CLIENT#${domain}`;
            const params = {
                TableName: this.studentsTableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                FilterExpression: 'department = :department',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':skPrefix': 'STUDENT#',
                    ':department': department
                }
            };

            const result = await dynamodb.query(params).promise();
            return (result.Items || []).map(item => item.email).filter(Boolean);
        } catch (error) {
            console.error('Error fetching students by department:', error);
            throw new Error('Failed to fetch students: ' + error.message);
        }
    }
}

module.exports = new NotificationService();

