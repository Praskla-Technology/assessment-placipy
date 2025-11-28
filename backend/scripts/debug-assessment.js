// Script to debug assessment fetching issues
const AWS = require('aws-sdk');

// Configure AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

// Table names
const assessmentsTableName = process.env.ASSESSMENTS_TABLE_NAME || 'Assesment_placipy_assesments';
const questionsTableName = process.env.QUESTIONS_TABLE_NAME || 'Assessment_placipy_assesessment_questions';

async function debugAssessment(assessmentId) {
    console.log(`Debugging assessment: ${assessmentId}`);
    
    // Try different domains
    const domains = ['ksrce.ac.in', 'example.com', 'test.edu'];
    
    for (const domain of domains) {
        console.log(`\n--- Checking domain: ${domain} ---`);
        
        // Check if assessment exists
        const assessmentParams = {
            TableName: assessmentsTableName,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
            ExpressionAttributeValues: {
                ':pk': `CLIENT#${domain}`,
                ':sk_prefix': `ASSESSMENT#${assessmentId}`
            }
        };
        
        try {
            console.log('Querying assessment with params:', JSON.stringify(assessmentParams, null, 2));
            const assessmentResult = await dynamodb.query(assessmentParams).promise();
            console.log('Assessment query result:', JSON.stringify(assessmentResult, null, 2));
            
            if (assessmentResult.Items && assessmentResult.Items.length > 0) {
                console.log(`Found assessment in domain ${domain}`);
                
                // Look for the exact match
                const exactMatch = assessmentResult.Items.find(item =>
                    item.SK === `ASSESSMENT#${assessmentId}` &&
                    !item.SK.includes('#MCQ_BATCH_') &&
                    !item.SK.includes('#CODING_BATCH_')
                );
                
                if (exactMatch) {
                    console.log('Exact assessment match found:', JSON.stringify(exactMatch, null, 2));
                    
                    // Now check for questions
                    const questionParams = {
                        TableName: questionsTableName,
                        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
                        ExpressionAttributeValues: {
                            ':pk': `CLIENT#${domain}`,
                            ':sk_prefix': `ASSESSMENT#${assessmentId}#`
                        }
                    };
                    
                    console.log('Querying questions with params:', JSON.stringify(questionParams, null, 2));
                    const questionResult = await dynamodb.query(questionParams).promise();
                    console.log('Question query result:', JSON.stringify(questionResult, null, 2));
                    
                    return;
                }
            }
        } catch (error) {
            console.error(`Error querying domain ${domain}:`, error);
        }
    }
    
    // Try original structure
    console.log('\n--- Trying original structure ---');
    const originalParams = {
        TableName: assessmentsTableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
        ExpressionAttributeValues: {
            ':pk': `ASSESSMENT#${assessmentId}`,
            ':sk_prefix': 'QUESTION#'
        }
    };
    
    try {
        console.log('Querying with original params:', JSON.stringify(originalParams, null, 2));
        const originalResult = await dynamodb.query(originalParams).promise();
        console.log('Original structure result:', JSON.stringify(originalResult, null, 2));
    } catch (error) {
        console.error('Error querying original structure:', error);
    }
}

// Get assessment ID from command line argument
const assessmentId = process.argv[2];

if (!assessmentId) {
    console.log('Usage: node debug-assessment.js <assessment-id>');
    console.log('Example: node debug-assessment.js ASSESS_CSE_002');
    process.exit(1);
}

debugAssessment(assessmentId).then(() => {
    console.log('\nDebug completed');
}).catch(error => {
    console.error('Debug failed:', error);
});