// @ts-nocheck
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
});

class ResultsService {
    private resultsTableName: string;

    constructor() {
        this.resultsTableName = process.env.RESULTS_TABLE_NAME || 'Assesment_placipy_results';
        console.log('ResultsService initialized with table name:', this.resultsTableName);
        console.log('Environment variables:');
        console.log('- RESULTS_TABLE_NAME:', process.env.RESULTS_TABLE_NAME);
        console.log('- DYNAMODB_TABLE_NAME:', process.env.DYNAMODB_TABLE_NAME);
        console.log('- ASSESSMENTS_TABLE_NAME:', process.env.ASSESSMENTS_TABLE_NAME);
        console.log('- QUESTIONS_TABLE_NAME:', process.env.QUESTIONS_TABLE_NAME);
    }

    /**
     * Save student assessment result
     */
    async saveAssessmentResult(resultData: any): Promise<any> {
        try {
            console.log('=== Saving Assessment Result ===');
            console.log('Results table name:', this.resultsTableName);
            console.log('Result Data:', JSON.stringify(resultData, null, 2));
            
            const {
                assessmentId,
                studentId,
                studentEmail,
                studentName,
                department,
                answers,
                score,
                maxScore,
                percentage,
                timeTaken,
                submittedAt,
                codingSubmissions
            } = resultData;

            // Validate required fields
            if (!assessmentId) {
                throw new Error('Assessment ID is required');
            }

            if (!studentId) {
                throw new Error('Student ID is required');
            }

            // Create the result item
            const resultItem = {
                PK: `ASSESSMENT#${assessmentId}#STUDENT#${studentId}`,
                SK: `RESULT#${submittedAt || new Date().toISOString()}`,
                assessmentId,
                studentId,
                studentEmail: studentEmail || '',
                studentName: studentName || studentEmail || studentId,
                department: department || 'Unknown',
                answers: answers || {},
                score: score || 0,
                maxScore: maxScore || 0,
                percentage: percentage || 0,
                timeTaken: timeTaken || 0,
                submittedAt: submittedAt || new Date().toISOString(),
                codingSubmissions: codingSubmissions || {},
                entityType: 'assessment_result',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Saving result item:', JSON.stringify(resultItem, null, 2));

            const params = {
                TableName: this.resultsTableName,
                Item: resultItem
            };

            console.log('DynamoDB put params:', JSON.stringify(params, null, 2));
            await dynamodb.put(params).promise();
            
            console.log('Result saved successfully');
            return resultItem;
        } catch (error: any) {
            console.error('Error saving assessment result:', error);
            console.error('Error stack:', error.stack);
            
            // Provide more specific error messages
            if (error.code === 'ResourceNotFoundException') {
                throw new Error(`Results table "${this.resultsTableName}" not found. Please check your DynamoDB configuration.`);
            } else if (error.code === 'AccessDeniedException') {
                throw new Error('Access denied to DynamoDB. Please check your AWS credentials and permissions.');
            } else if (error.code === 'ValidationException') {
                throw new Error('Invalid data format. Please check the result data being saved.');
            }
            
            throw new Error('Failed to save assessment result: ' + error.message);
        }
    }

    /**
     * Get student's assessment results
     */
    async getStudentResults(studentId: string, assessmentId?: string): Promise<any[]> {
        try {
            console.log('=== Getting Student Results ===');
            console.log('Student ID:', studentId);
            console.log('Assessment ID:', assessmentId);

            let params: any;

            if (assessmentId) {
                // Get specific assessment result for student
                params = {
                    TableName: this.resultsTableName,
                    KeyConditionExpression: 'PK = :pk',
                    ExpressionAttributeValues: {
                        ':pk': `ASSESSMENT#${assessmentId}#STUDENT#${studentId}`
                    }
                };
            } else {
                // Get all results for student (scan with filter)
                params = {
                    TableName: this.resultsTableName,
                    FilterExpression: 'studentId = :studentId',
                    ExpressionAttributeValues: {
                        ':studentId': studentId
                    }
                };
            }

            console.log('Query params:', JSON.stringify(params, null, 2));
            // Use scan for filter expressions, query for key conditions
            const result = assessmentId ? 
                await dynamodb.query(params).promise() : 
                await dynamodb.scan(params).promise();
            console.log('Query result:', JSON.stringify(result, null, 2));

            return result.Items || [];
        } catch (error) {
            console.error('Error getting student results:', error);
            throw new Error('Failed to retrieve student results: ' + error.message);
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