// @ts-nocheck
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    region: 'us-east-1' // Change to your region
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = 'Assesment_placipy'; // Change to your table name

// Sample data to populate the table according to your schema
const sampleData = [
    // Admin User
    {
        PK: 'GLOBAL#ADMIN',
        SK: 'ADMIN#admin@praskla.com',
        email: 'admin@praskla.com',
        name: 'Global Super Admin',
        role: 'Admin',
        createdAt: new Date().toISOString()
    },
    // College Client Metadata
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'METADATA',
        clientType: 'college',
        collegeName: 'KSR College of Engineering',
        domain: 'ksrce.ac.in',
        location: 'Salem',
        createdAt: new Date().toISOString()
    },
    // Student User (demo account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'STUDENT#student@ksrce.ac.in',
        email: 'student@ksrce.ac.in',
        name: 'Arun',
        role: 'Student',
        department: 'CSE',
        year: 3,
        createdAt: new Date().toISOString()
    },
    // Student User (real account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'STUDENT#Arun2427@ksrce.ac.in',
        email: 'Arun2427@ksrce.ac.in',
        name: 'Arun',
        role: 'Student',
        department: 'CSE',
        year: 3,
        createdAt: new Date().toISOString()
    },
    // PTO User (demo account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'PTO#pto@ksrce.ac.in',
        email: 'pto@ksrce.ac.in',
        name: 'Kavin',
        role: 'PTO',
        createdAt: new Date().toISOString()
    },
    // PTO User (real account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'PTO#1001',
        email: 'PTO@ksrce.ac.in',
        name: 'Kavin',
        role: 'PTO',
        createdAt: new Date().toISOString()
    },
    // PTS User (demo account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'PTS#pts@ksrce.ac.in',
        email: 'pts@ksrce.ac.in',
        name: 'Ravi',
        role: 'PTS',
        department: 'MECH',
        joiningDate: '2022-05-01',
        createdAt: new Date().toISOString()
    },
    // PTS User (real account)
    {
        PK: 'CLIENT#ksrce.ac.in',
        SK: 'PTS#2001',
        email: 'PTS@ksrce.ac.in',
        name: 'Ravi',
        role: 'PTS',
        department: 'MECH',
        joiningDate: '2022-05-01',
        createdAt: new Date().toISOString()
    }
];

async function populateTestData() {
    try {
        console.log('Populating test data...');

        for (const item of sampleData) {
            const params = {
                TableName: tableName,
                Item: item
            };

            await dynamodb.put(params).promise();
            console.log(`Added item with PK: ${item.PK}, SK: ${item.SK}`);
        }

        console.log('Test data populated successfully!');
    } catch (error) {
        console.error('Error populating test data:', error);
    }
}

// Run the function
populateTestData();