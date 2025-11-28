// @ts-nocheck
require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS SDK
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const assessmentsTableName = process.env.ASSESSMENTS_TABLE_NAME || 'Assesment_placipy_assesments';
const questionsTableName = process.env.QUESTIONS_TABLE_NAME || 'Assessment_placipy_assesessment_questions';

async function testCodingTestCasesDisplay(assessmentId) {
    console.log(`Testing coding test cases display for assessment: ${assessmentId}`);
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
        
        // Test 3: Process coding questions and check test cases format
        console.log('\n=== TEST 3: Processing Coding Questions and Test Cases ===');
        let allQuestions = [];
        
        if (allQuestionsResult.Items && allQuestionsResult.Items.length > 0) {
            // Extract questions from all batch items
            for (const batchItem of allQuestionsResult.Items) {
                if (batchItem.questions && Array.isArray(batchItem.questions)) {
                    for (const question of batchItem.questions) {
                        allQuestions.push(question);
                        
                        console.log(`\nProcessing question: ${question.questionId} (${question.entityType})`);
                        
                        // Check if it's a coding question
                        if (question.entityType === 'coding') {
                            console.log('  This is a coding question');
                            
                            // Display question details
                            console.log('  Question:', question.question);
                            console.log('  Starter Code:', question.starterCode);
                            
                            // Check for test cases
                            if (question.testCases) {
                                console.log(`  Test cases found: ${question.testCases.length}`);
                                console.log('  Test cases:', JSON.stringify(question.testCases, null, 2));
                                
                                // Check format of each test case
                                question.testCases.forEach((testCase, index) => {
                                    console.log(`    Test Case ${index + 1}:`);
                                    console.log(`      Input: ${testCase.input}`);
                                    console.log(`      Expected Output: ${testCase.expectedOutput}`);
                                    
                                    // Check if format is correct for frontend
                                    if (testCase.input !== undefined && testCase.expectedOutput !== undefined) {
                                        console.log('      ✅ Format is correct for frontend display');
                                    } else {
                                        console.log('      ⚠️  Format may need adjustment for frontend display');
                                        if (testCase.inputs) {
                                            console.log(`      Found inputs: ${JSON.stringify(testCase.inputs)}`);
                                        }
                                    }
                                });
                            } else {
                                console.log('  ⚠️  No test cases found');
                            }
                        } else {
                            console.log('  This is not a coding question');
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
        console.error('Error testing coding test cases display:', error);
    }
}

// Get assessment ID from command line arguments
const assessmentId = process.argv[2] || 'ASSESS_CSE_001';
testCodingTestCasesDisplay(assessmentId);