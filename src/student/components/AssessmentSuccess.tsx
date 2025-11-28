import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AssessmentSuccess.css';

const AssessmentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get assessment data from location state if available
  const { assessmentTitle, score, totalScore } = location.state || {};
  
  const handleGoHome = () => {
    navigate('/student/assessments');
  };

  const handleViewResults = () => {
    navigate('/student/results');
  };

  return (
    <div className="assessment-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Assessment Submitted Successfully!</h1>
        <p className="success-message">
          Your answers have been recorded successfully.
          {assessmentTitle && (
            <span> Thank you for completing the <strong>{assessmentTitle}</strong> assessment.</span>
          )}
        </p>
        
        {score !== undefined && totalScore !== undefined && (
          <div className="score-summary">
            <h2>Your Score</h2>
            <p className="score-text">{score} / {totalScore}</p>
            <p className="percentage-text">{Math.round((score / totalScore) * 100)}%</p>
          </div>
        )}
        
        <div className="success-actions">
          <button className="btn btn-primary" onClick={handleViewResults}>
            View Results
          </button>
          <button className="btn btn-secondary" onClick={handleGoHome}>
            Back to Assessments
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSuccess;