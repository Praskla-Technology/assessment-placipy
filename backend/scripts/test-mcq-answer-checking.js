// @ts-nocheck
require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const assessmentsTableName = process.env.ASSESSMENTS_TABLE_NAME || 'Assesment_placipy_assesments';
const questionsTableName = process.env.QUESTIONS_TABLE_NAME || 'Assessment_placipy_assesessment_questions';

async function testMCQAnswerChecking(assessmentId) {
    console.log(`Testing MCQ answer checking for assessment: ${assessmentId}`);
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
        
        // Test 3: Process MCQ questions and check answer format
        console.log('\n=== TEST 3: Processing MCQ Questions and Answer Checking ===');
        let allQuestions = [];
        
        if (allQuestionsResult.Items && allQuestionsResult.Items.length > 0) {
            // Extract questions from all batch items
            for (const batchItem of allQuestionsResult.Items) {
                if (batchItem.questions && Array.isArray(batchItem.questions)) {
                    for (const question of batchItem.questions) {
                        allQuestions.push(question);
                        
                        console.log(`\nProcessing question: ${question.questionId} (${question.entityType})`);
                        
                        // Check if it's an MCQ question
                        if (question.entityType === 'mcq') {
                            console.log('  This is an MCQ question');
                            
                            // Display question details
                            console.log('  Question:', question.question);
                            console.log('  Options:', question.options);
                            console.log('  Correct Answer:', question.correctAnswer);
                            
                            // Check answer format
                            if (question.correctAnswer !== undefined) {
                                if (Array.isArray(question.correctAnswer)) {
                                    console.log('  ✅ Correct answer is an array:', question.correctAnswer);
                                } else if (typeof question.correctAnswer === 'string') {
                                    console.log('  ✅ Correct answer is a string:', question.correctAnswer);
                                } else {
                                    console.log('  ⚠️  Unexpected correct answer format:', typeof question.correctAnswer);
                                }
                            } else {
                                console.log('  ⚠️  No correct answer defined');
                            }
                            
                            // Simulate answer checking
                            console.log('  Simulating answer checking:');
                            const sampleAnswers = ['A', 'B', 'C', 'D'];
                            sampleAnswers.forEach(answer => {
                                let isCorrect = false;
                                if (Array.isArray(question.correctAnswer)) {
                                    isCorrect = question.correctAnswer.includes(answer);
                                } else if (typeof question.correctAnswer === 'string') {
                                    isCorrect = question.correctAnswer === answer;
                                }
                                console.log(`    Answer ${answer}: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
                            });
                        } else {
                            console.log('  This is not an MCQ question');
                        }
                    }
                }
            }
        }
        
        console.log(`\nTotal questions found: ${allQuestions.length}`);
        
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
        console.error('Error testing MCQ answer checking:', error);
    }
}

// Get assessment ID from command line arguments
const assessmentId = process.argv[2] || 'ASSESS_CSE_001';
testMCQAnswerChecking(assessmentId);