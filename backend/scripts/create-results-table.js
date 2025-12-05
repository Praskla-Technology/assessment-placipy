const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS with explicit credentials from .env
AWS.config.update({
  region: process.env.AWS_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

// Table name from environment variables
const tableName = process.env.RESULTS_TABLE_NAME || 'Assessment_placipy_asseessment_result';

async function createResultsTable() {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },  // Partition key
      { AttributeName: 'SK', KeyType: 'RANGE' }  // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST' // On-demand billing
  };

  try {
    console.log(`Creating DynamoDB table: ${tableName}`);
    const result = await dynamodb.createTable(params).promise();
    console.log('Table creation initiated:', result.TableDescription.TableStatus);
    
    // Wait for table to be created
    console.log('Waiting for table to be created...');
    await dynamodb.waitFor('tableExists', { TableName: tableName }).promise();
    console.log('Table created successfully!');
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('Table already exists');
    } else {
      console.error('Error creating table:', error);
      throw error;
    }
  }
}

// Run the function
createResultsTable().catch(console.error);