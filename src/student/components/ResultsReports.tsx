import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsService from '../../services/results.service';

const ResultsReports: React.FC = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch results when component mounts
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ResultsService.getStudentResults();
        console.log('Results response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        // Handle different response formats
        let results = [];
        if (response) {
          if (Array.isArray(response)) {
            // Direct array response
            results = response;
          } else if (response.data) {
            // Response with data property
            results = Array.isArray(response.data) ? response.data : [];
          } else if (response.success && response.data) {
            // Response with success flag
            results = Array.isArray(response.data) ? response.data : [];
          }
        }
        
        console.log('Extracted results:', results);
        console.log('Results count:', results.length);
        setTestResults(results);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Only show error if it's not a 404 (no results is not an error)
        if (err.response?.status !== 404) {
          const errorMessage = err.response?.data?.message || 
                              err.message || 
                              'Failed to fetch results. Please try again later.';
          setError(errorMessage);
        } else {
          // 404 means no results found, which is fine
          setTestResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleViewResult = (result: any) => {
    // Navigate to result detail page with attemptId (SK)
    if (result.SK) {
      const encodedAttemptId = encodeURIComponent(result.SK);
      navigate(`/student/results/${encodedAttemptId}`);
    }
  };


  if (loading) {
    return (
      <div className="results-reports-page">
        <div className="loading-container">
          <h2>Loading Results...</h2>
          <p>Please wait while we fetch your results.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-reports-page">
        <div className="error-container">
          <h2>Error Loading Results</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-reports-page">
      <h2>Results & Reports</h2>
      
      <div className="scores-tab">
        <h3>Your Test Scores</h3>
        {testResults.length > 0 ? (
          <div className="results-table">
            <div className="table-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr' }}>
              <div>Assessment Title</div>
              <div>Score / Max</div>
              <div>Percentage</div>
              <div>Accuracy</div>
              <div>Submitted At</div>
              <div>Action</div>
            </div>
            {testResults.map((result: any, index: number) => (
              <div key={index} className="table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr' }}>
                <div>{result.assessmentId || 'Assessment'}</div>
                <div className="score">{result.score || 0} / {result.maxScore || 0}</div>
                <div>{result.percentage || 0}%</div>
                <div>{result.accuracy || 0}%</div>
                <div>{result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'}</div>
                <div>
                  <button 
                    onClick={() => handleViewResult(result)}
                    style={{
                      padding: '6px 12px',
                      background: '#9768E1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    View Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No assessment results available yet.</p>
            <p>Complete assessments to see your scores here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsReports;