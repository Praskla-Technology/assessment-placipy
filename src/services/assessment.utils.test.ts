import { fetchAssessmentWithQuestions, fetchAssessmentQuestions } from './assessment.utils';

/**
 * Test function to demonstrate the usage of our assessment utilities
 */
async function testAssessmentUtils() {
  try {
    console.log('Testing assessment utilities...');
    
    // Example assessment ID (replace with a real one from your database)
    const assessmentId = 'ASSESS_CSE_001';
    
    // Test fetching assessment with questions
    console.log(`Fetching assessment ${assessmentId} with questions...`);
    const assessmentWithData = await fetchAssessmentWithQuestions(assessmentId);
    console.log('Assessment with questions:', assessmentWithData);
    
    // Test fetching only questions
    console.log(`Fetching questions for assessment ${assessmentId}...`);
    const questions = await fetchAssessmentQuestions(assessmentId);
    console.log('Questions:', questions);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAssessmentUtils();
}

export default testAssessmentUtils;