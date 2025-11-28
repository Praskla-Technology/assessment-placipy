import React, { useState, useEffect } from 'react';
import ResultsService from '../../services/results.service';

const ResultsReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scores');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [departmentRankings, setDepartmentRankings] = useState<any[]>([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch results when component mounts
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await ResultsService.getMyResults();
        if (response.success) {
          setTestResults(response.data);
        } else {
          setError('Failed to fetch results: ' + (response.message || 'Unknown error'));
        }
      } catch (err: any) {
        console.error('Error fetching results:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        const errorMessage = err.response?.data?.message || 
                            err.message || 
                            'Failed to fetch results. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Mock data for department rankings (in a real app, this would come from the API)
  useEffect(() => {
    setDepartmentRankings([
      { rank: 1, name: 'Alice Johnson', score: 95 },
      { rank: 2, name: 'Michael Chen', score: 92 },
      { rank: 3, name: 'Sarah Williams', score: 90 },
      { rank: 4, name: 'John Doe', score: 85 },
      { rank: 5, name: 'Emma Davis', score: 82 },
    ]);
  }, []);

  // Mock detailed analysis data (in a real app, this would come from the API)
  useEffect(() => {
    setDetailedAnalysis({
      testName: 'Mathematics Quiz',
      correctAnswers: 17,
      totalQuestions: 20,
      timeSpent: '45 minutes',
      feedback: 'Good work on algebra questions. Need to improve on geometry concepts.'
    });
  }, []);

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
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'scores' ? 'active' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          Scores & Ranks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Detailed Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          Department Ranking
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'scores' && (
          <div className="scores-tab">
            <h3>Your Test Scores</h3>
            {testResults.length > 0 ? (
              <div className="results-table">
                <div className="table-header">
                  <div>Test Name</div>
                  <div>Score</div>
                  <div>Rank</div>
                  <div>Date</div>
                </div>
                {testResults.map((result: any, index: number) => (
                  <div key={index} className="table-row">
                    <div>{result.assessmentId || 'Assessment'}</div>
                    <div className="score">{result.percentage || 0}%</div>
                    <div>#{index + 1}/{testResults.length}</div>
                    <div>{result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}</div>
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
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-tab">
            <h3>Detailed Analysis</h3>
            <div className="analysis-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Questions Answered</h4>
                  <p className="stat-value">{detailedAnalysis?.correctAnswers || 0}/{detailedAnalysis?.totalQuestions || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Time Spent</h4>
                  <p className="stat-value">{detailedAnalysis?.timeSpent || '0 minutes'}</p>
                </div>
                <div className="stat-card">
                  <h4>Accuracy</h4>
                  <p className="stat-value">{detailedAnalysis ? Math.round((detailedAnalysis.correctAnswers/detailedAnalysis.totalQuestions)*100) : 0}%</p>
                </div>
              </div>
              <div className="feedback-section">
                <h4>Feedback</h4>
                <p>{detailedAnalysis?.feedback || 'No feedback available.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="ranking-tab">
            <h3>Department Ranking Board</h3>
            <div className="ranking-list">
              {departmentRankings.map(student => (
                <div 
                  key={student.rank} 
                  className={`ranking-item ${student.name === 'John Doe' ? 'current-student' : ''}`}
                >
                  <div className="rank">#{student.rank}</div>
                  <div className="name">{student.name}</div>
                  <div className="score">{student.score}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsReports;