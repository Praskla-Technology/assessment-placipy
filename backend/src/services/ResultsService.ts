// @ts-nocheck
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

class ResultsService {
    private resultsTableName: string;

    constructor() {
        // Use dedicated results table - EXACT table name as specified by user
        // Results are stored with PK: CLIENT#<domain> and SK: RESULT#ASSESSMENT#<id>#<email>
        // User specified table: Assessment_placipy_asseessment_result
        this.resultsTableName = 'Assessment_placipy_asseessment_result';
        console.log('========================================');
        console.log('ResultsService initialized');
        console.log('Table name:', this.resultsTableName);
        console.log('AWS Region:', process.env.AWS_REGION || 'not set');
        console.log('========================================');
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
     * Save student assessment result - EXACT schema as specified
     */
    async saveAssessmentResult(resultData: any): Promise<any> {
        try {
            console.log('=== Saving Assessment Result ===');
            console.log('Results table name:', this.resultsTableName);
            console.log('Result Data:', JSON.stringify(resultData, null, 2));
            
            const {
                assessmentId,
                email,
                Name,
                department,
                answers,
                score,
                maxScore,
                percentage,
                accuracy,
                numCorrect,
                numIncorrect,
                numUnattempted,
                entity_marks,
                timeSpentSeconds,
                submittedAt
            } = resultData;

            // Validate required fields
            if (!assessmentId) {
                throw new Error('Assessment ID is required');
            }

            if (!email) {
                throw new Error('Student email is required');
            }

            // Get domain from email
            const collegeDomain = this.getDomainFromEmail(email);
            const PK = `CLIENT#${collegeDomain}`;
            const SK = `RESULT#ASSESSMENT#${assessmentId}#${email}`;
            const submittedAtISO = submittedAt || new Date().toISOString();

            // Create the result item with EXACT schema
            const resultItem = {
                PK,
                SK,
                accuracy: accuracy || 0,
                answers: answers || [],
                assessmentId,
                department: department || 'Unknown',
                email,
                entity_marks: entity_marks || {},
                evaluated: true,
                maxScore: maxScore || 0,
                Name: Name || email,
                numCorrect: numCorrect || 0,
                numIncorrect: numIncorrect || 0,
                numUnattempted: numUnattempted || 0,
                percentage: percentage || 0,
                rank: null,
                score: score || 0,
                submittedAt: submittedAtISO,
                timeSpentSeconds: timeSpentSeconds || 0
            };

            console.log('========================================');
            console.log('SAVING TO TABLE:', this.resultsTableName);
            console.log('AWS Region:', process.env.AWS_REGION || 'not set');
            console.log('Result item:', JSON.stringify(resultItem, null, 2));
            console.log('========================================');

            const params = {
                TableName: this.resultsTableName,
                Item: resultItem
            };

            console.log('DynamoDB PUT operation starting...');
            console.log('Table:', this.resultsTableName);
            console.log('PK:', resultItem.PK);
            console.log('SK:', resultItem.SK);
            
            const putResult = await dynamodb.put(params).promise();
            
            console.log('========================================');
            console.log('✅ RESULT SAVED SUCCESSFULLY!');
            console.log('Table:', this.resultsTableName);
            console.log('========================================');
            return resultItem;
        } catch (error: any) {
            console.error('Error saving assessment result:', error);
            console.error('Error stack:', error.stack);
            console.error('Error code:', error.code);
            console.error('Error name:', error.name);
            console.error('Table name being used:', this.resultsTableName);
            
            // Provide more specific error messages
            if (error.code === 'ResourceNotFoundException') {
                const errorMsg = `DynamoDB table "${this.resultsTableName}" does not exist. Please create the table with PK (String) and SK (String) as keys.`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            } else if (error.code === 'AccessDeniedException') {
                throw new Error('Access denied to DynamoDB. Please check your AWS credentials and permissions.');
            } else if (error.code === 'ValidationException') {
                throw new Error('Invalid data format. Please check the result data being saved.');
            }
            
            throw new Error('Failed to save assessment result: ' + (error.message || error.toString()));
        }
    }

    /**
     * Get student's assessment results by email
     */
    async getStudentResults(studentEmail: string): Promise<any[]> {
        try {
            console.log('=== Getting Student Results ===');
            console.log('Student Email:', studentEmail);

            // Get domain from email
            const collegeDomain = this.getDomainFromEmail(studentEmail);
            const PK = `CLIENT#${collegeDomain}`;

            // Query all results for this student (SK starts with RESULT#ASSESSMENT#)
            const params = {
                TableName: this.resultsTableName,
                KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
                FilterExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':pk': PK,
                    ':skPrefix': 'RESULT#ASSESSMENT#',
                    ':email': studentEmail
                }
            };
                
            console.log('Query params:', JSON.stringify(params, null, 2));
            const result = await dynamodb.query(params).promise();
            console.log('Query result:', JSON.stringify(result, null, 2));
            return result.Items || [];
        } catch (error) {
            console.error('Error getting student results:', error);
            throw new Error('Failed to retrieve student results: ' + error.message);
        }
    }

    /**
     * Get result by attemptId (SK)
     */
    async getResultByAttemptId(studentEmail: string, attemptId: string): Promise<any> {
        try {
            console.log('=== Getting Result By Attempt ID ===');
            console.log('Student Email:', studentEmail);
            console.log('Attempt ID:', attemptId);

            // Get domain from email
            const collegeDomain = this.getDomainFromEmail(studentEmail);
            const PK = `CLIENT#${collegeDomain}`;
            const SK = attemptId;

            const params = {
                TableName: this.resultsTableName,
                Key: {
                    PK,
                    SK
                }
            };

            console.log('Get params:', JSON.stringify(params, null, 2));
            const result = await dynamodb.get(params).promise();
            
            if (!result.Item) {
                throw new Error('Result not found');
            }

            // Verify the result belongs to the student
            // Check both the email field and the email in the SK
            const emailInSK = SK.split('#').pop(); // Extract email from SK: RESULT#ASSESSMENT#<id>#<email>
            const resultEmail = result.Item.email || emailInSK;
            
            // Case-insensitive comparison
            if (resultEmail.toLowerCase() !== studentEmail.toLowerCase() && 
                emailInSK.toLowerCase() !== studentEmail.toLowerCase()) {
                console.error('Email mismatch:', {
                    resultEmail: resultEmail,
                    emailInSK: emailInSK,
                    studentEmail: studentEmail
                });
                throw new Error('Unauthorized: Result does not belong to this student');
            }

            console.log('Get result:', JSON.stringify(result.Item, null, 2));
            return result.Item;
        } catch (error) {
            console.error('Error getting result by attempt ID:', error);
            throw new Error('Failed to retrieve result: ' + error.message);
        }
    }

    /**
     * Get all results for an assessment
     */
    async getAssessmentResults(assessmentId: string): Promise<any[]> {
        try {
            console.log('=== Getting Assessment Results ===');
            console.log('Assessment ID:', assessmentId);

            // Scan for all results with this assessment ID
            const params = {
                TableName: this.resultsTableName,
                FilterExpression: 'assessmentId = :assessmentId',
                ExpressionAttributeValues: {
                    ':assessmentId': assessmentId
                }
            };

            console.log('Scan params:', JSON.stringify(params, null, 2));
            const result = await dynamodb.scan(params).promise();
            console.log('Scan result count:', result.Count);

            return result.Items || [];
        } catch (error) {
            console.error('Error getting assessment results:', error);
            throw new Error('Failed to retrieve assessment results: ' + error.message);
        }
    }

    /**
     * Get student's rank in an assessment
     */
    async getStudentRank(assessmentId: string, studentId: string): Promise<any> {
        try {
            console.log('=== Getting Student Rank ===');
            console.log('Assessment ID:', assessmentId);
            console.log('Student ID:', studentId);

            // Get all results for this assessment
            const allResults = await this.getAssessmentResults(assessmentId);
            
            // Sort by score (descending)
            const sortedResults = allResults.sort((a, b) => b.score - a.score);
            
            // Find student's position
            const studentResult = sortedResults.find(result => result.studentId === studentId);
            const studentIndex = sortedResults.findIndex(result => result.studentId === studentId);
            
            if (!studentResult) {
                return { rank: null, totalStudents: sortedResults.length };
            }
            
            // Calculate rank (1-based index)
            const rank = studentIndex + 1;
            
            return {
                rank,
                totalStudents: sortedResults.length,
                score: studentResult.score,
                percentage: studentResult.percentage
            };
        } catch (error) {
            console.error('Error getting student rank:', error);
            throw new Error('Failed to retrieve student rank: ' + error.message);
        }
    }

    /**
     * Get department statistics
     */
    async getDepartmentStats(assessmentId: string): Promise<any> {
        try {
            console.log('=== Getting Department Stats ===');
            console.log('Assessment ID:', assessmentId);

            // Get all results for this assessment
            const allResults = await this.getAssessmentResults(assessmentId);
            
            // Group by department
            const departmentStats: any = {};
            
            allResults.forEach(result => {
                const dept = result.department || 'Unknown';
                if (!departmentStats[dept]) {
                    departmentStats[dept] = {
                        students: 0,
                        totalScore: 0,
                        maxScore: result.maxScore || 0,
                        highestScore: 0,
                        lowestScore: result.maxScore || 0
                    };
                }
                
                departmentStats[dept].students += 1;
                departmentStats[dept].totalScore += result.score;
                
                if (result.score > departmentStats[dept].highestScore) {
                    departmentStats[dept].highestScore = result.score;
                }
                
                if (result.score < departmentStats[dept].lowestScore) {
                    departmentStats[dept].lowestScore = result.score;
                }
            });
            
            // Calculate averages
            Object.keys(departmentStats).forEach(dept => {
                const stats = departmentStats[dept];
                stats.averageScore = stats.students > 0 ? Math.round((stats.totalScore / stats.students) * 100) / 100 : 0;
                stats.completionRate = stats.students > 0 ? Math.round((stats.students / stats.students) * 10000) / 100 : 0; // This would need total students in department
            });
            
            return departmentStats;
        } catch (error) {
            console.error('Error getting department stats:', error);
            throw new Error('Failed to retrieve department stats: ' + error.message);
        }
    }

    /**
     * Get top performers
     */
    async getTopPerformers(assessmentId: string, limit: number = 10): Promise<any[]> {
        try {
            console.log('=== Getting Top Performers ===');
            console.log('Assessment ID:', assessmentId);
            console.log('Limit:', limit);

            // Get all results for this assessment
            const allResults = await this.getAssessmentResults(assessmentId);
            
            // Sort by score (descending) and take top N
            const sortedResults = allResults.sort((a, b) => b.score - a.score);
            const topPerformers = sortedResults.slice(0, limit);
            
            // Add rank to each performer
            return topPerformers.map((result, index) => ({
                ...result,
                rank: index + 1
            }));
        } catch (error) {
            console.error('Error getting top performers:', error);
            throw new Error('Failed to retrieve top performers: ' + error.message);
        }
    }
}

module.exports = new ResultsService();