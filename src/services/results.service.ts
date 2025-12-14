import axios from 'axios';
import AuthService from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ResultsService {
  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    console.log('Using auth token:', token ? 'Bearer ***' : 'No token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Save assessment result
   */
  async saveAssessmentResult(resultData: any): Promise<any> {
    try {
      console.log('=== Saving Assessment Result ===');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Result Data:', JSON.stringify(resultData, null, 2));
      
      const headers = this.getAuthHeaders();
      console.log('Request headers:', headers);
      
      const response = await axios.post(
        `${API_BASE_URL}/student/submit-assessment`,
        resultData,
        { headers }
      );
      console.log('Assessment result save response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error saving assessment result:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. You do not have permission to save results.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error occurred while saving results. Please try again later.');
      } else if (error.message?.includes('Network Error')) {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to save assessment result');
    }
  }

  /**
   * Get all results for logged-in student
   */
  async getStudentResults(): Promise<any> {
    try {
      console.log('Fetching student results from:', `${API_BASE_URL}/student/results`);
      const response = await axios.get(
        `${API_BASE_URL}/student/results`,
        { headers: this.getAuthHeaders() }
      );
      console.log('Student results response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting student results:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error URL:', error.config?.url);
      
      // If 404, return empty results
      if (error.response?.status === 404) {
        console.log('404 error - returning empty results');
        return { success: true, data: [] };
      }
      
      // For other errors, also return empty array to prevent UI crash
      if (error.response?.status >= 400) {
        console.log('Error status:', error.response?.status, '- returning empty results');
        return { success: true, data: [] };
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to retrieve results');
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      console.log('=== Getting Dashboard Stats ===');
      const headers = this.getAuthHeaders();
      
      const response = await axios.get(
        `${API_BASE_URL}/student/dashboard-stats`,
        { headers }
      );
      
      console.log('Dashboard stats response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      
      if (error.response?.status === 404) {
        // No stats available yet, return empty data
        return {
          success: true,
          data: {
            completedTests: 0,
            averageScore: 0,
            ranking: null,
            recentAssessments: [],
            performanceData: []
          }
        };
      }
      
      throw new Error('Failed to retrieve dashboard statistics: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Get detailed result for a specific attempt
   */
  async getResultDetail(attemptId: string): Promise<any> {
    try {
      const encodedAttemptId = encodeURIComponent(attemptId);
      const response = await axios.get(
        `${API_BASE_URL}/student/results/${encodedAttemptId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting result detail:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve result detail');
    }
  }

  /**
   * Get student's results
   */
  async getMyResults(): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/results/my-results`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting my results:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // If it's a 404, it might mean no results exist yet
      if (error.response?.status === 404) {
        return { success: true, data: [] };
      }
      
      throw new Error(error.response?.data?.message || 'Failed to retrieve results');
    }
  }

  /**
   * Get specific assessment result
   */
  async getMyAssessmentResult(assessmentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/results/my-results/${assessmentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting my assessment result:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve assessment result');
    }
  }

  /**
   * Get all results for an assessment
   */
  async getAssessmentResults(assessmentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/results/assessment/${assessmentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting assessment results:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve assessment results');
    }
  }

  /**
   * Get student's rank in an assessment
   */
  async getMyRank(assessmentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/results/rank/${assessmentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting my rank:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve rank');
    }
  }

  /**
   * Get department statistics for an assessment
   */
  async getDepartmentStats(assessmentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/results/department-stats/${assessmentId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting department stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve department stats');
    }
  }

  /**
   * Get top performers for an assessment
   */
  async getTopPerformers(assessmentId: string, limit: number = 10): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      const response = await axios.get(
        `${API_BASE_URL}/results/top-performers/${assessmentId}?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error getting top performers:', error);
      throw new Error(error.response?.data?.message || 'Failed to retrieve top performers');
    }
  }
}

export default new ResultsService();
