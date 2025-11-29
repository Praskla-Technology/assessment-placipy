import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';

const AssessmentSubmitted: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get assessmentId and attemptId from location state
  const { assessmentId, attemptId } = location.state || {};
  
  const handleViewResult = () => {
    // If we have attemptId, navigate directly to detail page
    if (attemptId) {
      const encodedAttemptId = encodeURIComponent(attemptId);
      navigate(`/student/results/${encodedAttemptId}`);
    } else if (assessmentId) {
      // Fallback: navigate to results list
      navigate('/student/results');
    } else {
      navigate('/student/results');
    }
  };

  return (
    <div className="assessment-submitted-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      padding: '40px'
    }}>
      <div className="success-card" style={{
        background: 'white',
        borderRadius: '16px',
        padding: '60px 40px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div className="success-icon" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#4caf50',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0 auto 30px',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
        }}>
          ✓
        </div>
        <h1 style={{
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Your assessment has been successfully submitted
        </h1>
        <div style={{ marginTop: '40px' }}>
          <button 
            onClick={handleViewResult}
            className="btn btn-primary"
            style={{
              padding: '12px 30px',
              background: '#9768E1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#7d52c9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#9768E1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            View Your Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSubmitted;

