import StudentAssessmentService from './student.assessment.service';

/**
 * Utility function to automatically fetch assessment with questions
 * This provides a convenient way to get both assessment metadata and questions in one call
 */
export async function fetchAssessmentWithQuestions(assessmentId: string): Promise<any> {
  try {
    // Validate input
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    console.log(`Fetching assessment with questions: ${assessmentId}`);
    const response = await StudentAssessmentService.getAssessmentWithQuestions(assessmentId);
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch assessment with questions');
    }
  } catch (error: any) {
    console.error('Error fetching assessment with questions:', error);
    throw new Error(error.message || 'Failed to fetch assessment with questions');
  }
}

/**
 * Utility function to fetch only assessment questions
 * This is useful when you already have the assessment metadata and only need questions
 */
export async function fetchAssessmentQuestions(assessmentId: string): Promise<any[]> {
  try {
    // Validate input
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    const response = await StudentAssessmentService.getAssessmentQuestions(assessmentId);
    if (response.success) {
      // Handle case where assessment exists but has no questions
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log(`Assessment ${assessmentId} exists but has no questions`);
        return [];
      }
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch assessment questions');
    }
  } catch (error: any) {
    console.error('Error fetching assessment questions:', error);
    // Provide more specific error handling
    if (error.message && error.message.includes('not found')) {
      throw new Error(`Assessment not found: ${error.message}`);
    }
    throw new Error(error.message || 'Failed to fetch assessment questions');
  }
}

/**
 * Utility function to automatically match assessment ID between tables and fetch questions
 * This ensures proper matching between assessment metadata and questions
 */
export async function fetchQuestionsForAssessment(assessmentId: string, domain: string = 'ksrce.ac.in'): Promise<any[]> {
  try {
    // Validate input
    if (!assessmentId) {
      throw new Error('Assessment ID is required');
    }
    
    console.log(`Fetching questions for assessment: ${assessmentId} in domain: ${domain}`);
    // The backend service handles the matching between tables automatically
    return await fetchAssessmentQuestions(assessmentId);
  } catch (error: any) {
    console.error(`Error fetching questions for assessment ${assessmentId}:`, error);
    throw new Error(`Failed to fetch questions for assessment ${assessmentId}: ${error.message}`);
  }
}

export default {
  fetchAssessmentWithQuestions,
  fetchAssessmentQuestions,
  fetchQuestionsForAssessment
};