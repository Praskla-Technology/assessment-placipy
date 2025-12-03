// @ts-nocheck
const AWS = require('aws-sdk');
const notificationService = require('../services/NotificationService');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

const assessmentsTableName = process.env.DYNAMODB_TABLE_NAME || 'Assesment_placipy';

/**
 * Check and send reminder notifications for scheduled assessments
 * This runs every 1 minute
 */
async function checkAndSendReminders() {
    try {
        console.log('[CRON] Checking for assessment reminders...');
        
        const now = new Date();
        const nowISO = now.toISOString();
        
        // Get all published assessments with scheduledAt
        // Note: This is a scan operation - in production, consider using a GSI
        const scanParams = {
            TableName: assessmentsTableName,
            FilterExpression: 'begins_with(SK, :skPrefix) AND isPublished = :isPublished AND attribute_exists(scheduling.startDate)',
            ExpressionAttributeValues: {
                ':skPrefix': 'ASSESSMENT#',
                ':isPublished': true
            }
        };

        let lastEvaluatedKey = null;
        const assessments = [];

        do {
            if (lastEvaluatedKey) {
                scanParams.ExclusiveStartKey = lastEvaluatedKey;
            }

            const result = await dynamodb.scan(scanParams).promise();
            assessments.push(...(result.Items || []));
            lastEvaluatedKey = result.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        console.log(`[CRON] Found ${assessments.length} published assessments with scheduling`);

        for (const assessment of assessments) {
            try {
                const startDate = assessment.scheduling?.startDate;
                if (!startDate) continue;

                const startTime = new Date(startDate);
                const timeDiff = startTime.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60);
                const minutesDiff = timeDiff / (1000 * 60);

                // Get students for this assessment
                const domain = assessment.domain || 'ksrce.ac.in';
                let studentEmails: string[] = [];

                // If assessment has target departments, get students by department
                if (assessment.target?.departments && assessment.target.departments.length > 0) {
                    for (const dept of assessment.target.departments) {
                        const deptStudents = await notificationService.getStudentsByDepartment(domain, dept);
                        studentEmails.push(...deptStudents);
                    }
                } else {
                    // Get all students for the domain
                    studentEmails = await notificationService.getStudentsByDomain(domain);
                }

                // Remove duplicates
                studentEmails = [...new Set(studentEmails)];

                console.log(`[CRON] Assessment ${assessment.assessmentId} has ${studentEmails.length} target students`);

                // Check for 24-hour reminder (24h ± 1 minute)
                if (hoursDiff >= 23.98 && hoursDiff <= 24.02) {
                    for (const email of studentEmails) {
                        const alreadySent = await notificationService.hasReminderBeenSent(
                            assessment.assessmentId,
                            email,
                            '24H'
                        );

                        if (!alreadySent) {
                            await notificationService.createNotificationForUser(
                                email,
                                email,
                                'reminder',
                                `Assessment Reminder: ${assessment.title}`,
                                `The assessment "${assessment.title}" starts in 24 hours. Please prepare accordingly.`,
                                `/student/assessments/${assessment.assessmentId}`,
                                'medium',
                                { assessmentId: assessment.assessmentId, reminderType: '24H' }
                            );
                            await notificationService.markReminderAsSent(
                                assessment.assessmentId,
                                email,
                                '24H'
                            );
                            console.log(`[CRON] Sent 24H reminder to ${email} for ${assessment.assessmentId}`);
                        }
                    }
                }

                // Check for 1-hour reminder (1h ± 1 minute)
                if (hoursDiff >= 0.98 && hoursDiff <= 1.02) {
                    for (const email of studentEmails) {
                        const alreadySent = await notificationService.hasReminderBeenSent(
                            assessment.assessmentId,
                            email,
                            '1H'
                        );

                        if (!alreadySent) {
                            await notificationService.createNotificationForUser(
                                email,
                                email,
                                'reminder',
                                `Assessment Reminder: ${assessment.title}`,
                                `The assessment "${assessment.title}" starts in 1 hour. Please be ready.`,
                                `/student/assessments/${assessment.assessmentId}`,
                                'medium',
                                { assessmentId: assessment.assessmentId, reminderType: '1H' }
                            );
                            await notificationService.markReminderAsSent(
                                assessment.assessmentId,
                                email,
                                '1H'
                            );
                            console.log(`[CRON] Sent 1H reminder to ${email} for ${assessment.assessmentId}`);
                        }
                    }
                }

                // Check for 10-minute reminder (10m ± 1 minute)
                if (minutesDiff >= 9 && minutesDiff <= 11) {
                    for (const email of studentEmails) {
                        const alreadySent = await notificationService.hasReminderBeenSent(
                            assessment.assessmentId,
                            email,
                            '10M'
                        );

                        if (!alreadySent) {
                            await notificationService.createNotificationForUser(
                                email,
                                email,
                                'reminder',
                                `Assessment Starting Soon: ${assessment.title}`,
                                `The assessment "${assessment.title}" starts in 10 minutes! Please join now.`,
                                `/student/assessments/${assessment.assessmentId}`,
                                'high',
                                { assessmentId: assessment.assessmentId, reminderType: '10M' }
                            );
                            await notificationService.markReminderAsSent(
                                assessment.assessmentId,
                                email,
                                '10M'
                            );
                            console.log(`[CRON] Sent 10M reminder to ${email} for ${assessment.assessmentId}`);
                        }
                    }
                }
            } catch (error) {
                console.error(`[CRON] Error processing assessment ${assessment.assessmentId}:`, error);
            }
        }

        console.log('[CRON] Reminder check completed');
    } catch (error) {
        console.error('[CRON] Error in reminder check:', error);
    }
}

/**
 * Delete old notifications (runs daily)
 */
async function deleteOldNotifications() {
    try {
        console.log('[CRON] Deleting old notifications...');
        const deletedCount = await notificationService.deleteOldNotifications(60);
        console.log(`[CRON] Deleted ${deletedCount} old notifications`);
    } catch (error) {
        console.error('[CRON] Error deleting old notifications:', error);
    }
}

/**
 * Start the cron job
 * Runs cleanup daily at midnight
 */
function startNotificationCron() {
    console.log('[CRON] Starting notification cron jobs...');

    // Run cleanup daily at midnight (in server timezone)
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
        deleteOldNotifications();
        // Then run every 24 hours
        setInterval(() => {
            deleteOldNotifications();
        }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    console.log('[CRON] Notification cron jobs started');
}

module.exports = {
    startNotificationCron,
    checkAndSendReminders,
    deleteOldNotifications
};

