// @ts-nocheck
require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const assessmentsTableName = process.env.ASSESSMENTS_TABLE_NAME || 'Assesment_placipy_assesments';
const questionsTableName = process.env.QUESTIONS_TABLE_NAME || 'Assessment_placipy_assesessment_questions';

async function testCodingQuestionFetch(assessmentId, questionId) {
    console.log(`Testing coding question fetch for assessment: ${assessmentId}, question: ${questionId}`);
    console.log(`Assessments table: ${assessmentsTableName}`);
    console.log(`Questions table: ${questionsTableName}`);
    
    try {
        // Test 1: Fetch assessment
        console.log('\n=== TEST 1: Fetching Assessment ===');
        const assessmentParams = {
            TableName: assessmentsTableName,
            KeyConditionExpression: 'PK = :pk AND SK = :sk',
            ExpressionAttributeValues: {
                ':pk': 'CLIENT#ksrce.ac.in',
                ':sk': `ASSESSMENT#${assessmentId}`
            }
        };
        
        console.log('Assessment query params:', JSON.stringify(assessmentParams, null, 2));
        const assessmentResult = await dynamodb.query(assessmentParams).promise();
        console.log('Assessment result:', JSON.stringify(assessmentResult, null, 2));
        
        if (!assessmentResult.Items || assessmentResult.Items.length === 0) {
            console.log('❌ No assessment found!');
            return;
        }
        
        console.log('✅ Assessment found!');
        
        // Test 2: Fetch all questions for the assessment
        console.log('\n=== TEST 2: Fetching All Questions ===');
        const allQuestionsParams = {
            TableName: questionsTableName,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
            ExpressionAttributeValues: {
                ':pk': 'CLIENT#ksrce.ac.in',
                ':sk_prefix': `ASSESSMENT#${assessmentId}#`
            }
        };
        
        console.log('All questions query params:', JSON.stringify(allQuestionsParams, null, 2));
        const allQuestionsResult = await dynamodb.query(allQuestionsParams).promise();
        console.log('All questions result:', JSON.stringify(allQuestionsResult, null, 2));
        
        // Test 3: Find the specific coding question
        console.log('\n=== TEST 3: Finding Specific Coding Question ===');
        let targetQuestion = null;
        let allQuestions = [];
        
        if (allQuestionsResult.Items && allQuestionsResult.Items.length > 0) {
            // Extract questions from all batch items
            for (const batchItem of allQuestionsResult.Items) {
                if (batchItem.questions && Array.isArray(batchItem.questions)) {
                    for (const question of batchItem.questions) {
                        allQuestions.push(question);
                        if (question.questionId === questionId) {
                            targetQuestion = question;
                        }
                    }
                }
            }
        }
        
        console.log(`Total questions found: ${allQuestions.length}`);
        
        if (targetQuestion) {
            console.log('✅ Target question found!');
            console.log('Target question:', JSON.stringify(targetQuestion, null, 2));
            
            // Check if it has test cases
            if (targetQuestion.testCases && targetQuestion.testCases.length > 0) {
                console.log('✅ Question has test cases!');
                console.log('Test cases:', JSON.stringify(targetQuestion.testCases, null, 2));
                
                // Format test cases for frontend consumption
                const formattedTestCases = targetQuestion.testCases.map(tc => ({
                    input: tc.inputs?.input || tc.input || '',
                    expectedOutput: tc.expectedOutput || ''
                }));
                
                console.log('Formatted test cases for frontend:', JSON.stringify(formattedTestCases, null, 2));
            } else {
                console.log('⚠️ Question found but no test cases present');
            }
        } else {
            console.log('❌ Target question not found!');
            console.log('Available questions:', allQuestions.map(q => q.questionId));
        }
        
        // Test 4: Combined result
        console.log('\n=== TEST 4: Combined Result ===');
        const combinedResult = {
            success: true,
            data: {
                assessment: assessmentResult.Items[0],
                questions: allQuestions
            }
        };
        
        console.log('Combined result:');
        console.log(JSON.stringify(combinedResult, null, 2));
        
    } catch (error) {
        console.error('Error testing coding question fetch:', error);
    }
}

// Get assessment ID and question ID from command line arguments
const assessmentId = process.argv[2] || 'ASSESS_CSE_001';
const questionId = process.argv[3] || 'Q_001';
testCodingQuestionFetch(assessmentId, questionId);