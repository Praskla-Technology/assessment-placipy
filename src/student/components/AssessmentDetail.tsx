import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentAssessmentService from '../../services/student.assessment.service';

const AssessmentDetail: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) return;
      
      try {
        setLoading(true);
        const data = await studentAssessmentService.getAssessmentWithQuestions(assessmentId);
        setAssessment(data);
      } catch (err: any) {
        console.error('Error fetching assessment:', err);
        setError(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const handleStartAssessment = () => {
    navigate(`/student/assessment-taking/${assessmentId}`);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading assessment...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: '#EF4444', marginBottom: '16px' }}>Error: {error}</div>
        <button onClick={() => navigate('/student/assessments')} className="back-btn">
          Back to Assessments
        </button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>Assessment not found</div>
        <button onClick={() => navigate('/student/assessments')} className="back-btn">
          Back to Assessments
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <button 
        onClick={() => navigate('/student/assessments')} 
        className="back-btn"
        style={{ marginBottom: '20px' }}
      >
        ← Back to Assessments
      </button>

      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '16px', fontSize: '24px' }}>{assessment.title}</h1>
        
        {assessment.description && (
          <p style={{ color: '#6B7280', marginBottom: '20px' }}>{assessment.description}</p>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>Department</div>
            <div style={{ fontWeight: '500' }}>{assessment.department || 'All Departments'}</div>
          </div>
          
          <div>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>Duration</div>
            <div style={{ fontWeight: '500' }}>{assessment.configuration?.duration || 60} minutes</div>
          </div>
          
          <div>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>Total Questions</div>
            <div style={{ fontWeight: '500' }}>{assessment.configuration?.totalQuestions || assessment.questions?.length || 0}</div>
          </div>
          
          <div>
            <div style={{ color: '#6B7280', fontSize: '14px' }}>Difficulty</div>
            <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>
              {assessment.difficulty || 'Medium'}
            </div>
          </div>
        </div>

        {assessment.scheduling && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Schedule</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div>
                <span style={{ color: '#6B7280' }}>Start: </span>
                <span>{formatDate(assessment.scheduling.startDate)}</span>
              </div>
              <div>
                <span style={{ color: '#6B7280' }}>End: </span>
                <span>{formatDate(assessment.scheduling.endDate)}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleStartAssessment}
          style={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Start Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessmentDetail;
