import React, { useState } from 'react';

const Assessments: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showLiveInfo, setShowLiveInfo] = useState(false);
  const [liveInfo] = useState({
    link: 'https://example.com/live-assessment',
    password: 'PLCY-7842'
  });
  
  // Mock data for assessments
  const allAssessments = [
    { 
      id: 1, 
      title: 'Mathematics Quiz', 
      subject: 'Mathematics',
      startTime: '2025-11-15 10:00 AM',
      duration: '60 minutes',
      instructions: 'Complete all questions. No calculators allowed.',
      status: 'active'
    },
    { 
      id: 2, 
      title: 'Physics Test', 
      subject: 'Physics',
      startTime: '2025-11-20 02:00 PM',
      duration: '90 minutes',
      instructions: 'Show all work for partial credit.',
      status: 'upcoming'
    },
    { 
      id: 3, 
      title: 'Chemistry Exam', 
      subject: 'Chemistry',
      startTime: '2025-10-30 09:00 AM',
      duration: '120 minutes',
      instructions: 'Multiple choice and essay questions.',
      status: 'completed'
    },
    { 
      id: 4, 
      title: 'Biology Midterm', 
      subject: 'Biology',
      startTime: '2025-11-25 11:00 AM',
      duration: '90 minutes',
      instructions: 'Bring pencil and eraser.',
      status: 'upcoming'
    },
  ];

  const filteredAssessments = activeFilter === 'all' 
    ? allAssessments 
    : allAssessments.filter(assessment => assessment.subject.toLowerCase() === activeFilter);

  const uniqueSubjects = Array.from(new Set(allAssessments.map(a => a.subject.toLowerCase())));

  const handleAttendTest = (assessmentId: number) => {
    alert(`Attending test #${assessmentId}`);
    // In a real app, this would navigate to the test page
  };

  const handleViewResults = (assessmentId: number) => {
    alert(`Viewing results for test #${assessmentId}`);
    // In a real app, this would navigate to the results page
  };

  return (
    <div className="assessments-page">
      <h2>Assessments</h2>
      
      <div className="filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          style={{
            border: activeFilter === 'all' ? '1px solid #9768E1' : '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '8px 12px',
            background: activeFilter === 'all' ? '#9768E1' : '#FFFFFF',
            color: activeFilter === 'all' ? '#FFFFFF' : '#111827',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
            userSelect: 'none'
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 4px rgba(79,70,229,0.12)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
          onMouseLeave={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(1)'; t.style.boxShadow = 'none'; }}
          onTouchStart={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(0.97)'; t.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.12)'; }}
          onTouchEnd={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(1)'; t.style.boxShadow = 'none'; }}
          onClick={() => setActiveFilter('all')}
        >
          All Assessments
        </button>
        {uniqueSubjects.map(subject => (
          <button 
            key={subject}
            className={`filter-btn ${activeFilter === subject ? 'active' : ''}`}
            style={{
              border: activeFilter === subject ? '1px solid #9768E1' : '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
              background: activeFilter === subject ? '#9768E1' : '#FFFFFF',
              color: activeFilter === subject ? '#FFFFFF' : '#111827',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
              userSelect: 'none'
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 4px rgba(79,70,229,0.12)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
            onMouseLeave={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(1)'; t.style.boxShadow = 'none'; }}
            onTouchStart={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(0.97)'; t.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.12)'; }}
            onTouchEnd={(e) => { const t = e.currentTarget as HTMLButtonElement; t.style.transform = 'scale(1)'; t.style.boxShadow = 'none'; }}
            onClick={() => setActiveFilter(subject)}
          >
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </button>
        ))}
      </div>

      {/* Floating Live Assessment button (bottom-right corner) */}
      <button
        onClick={() => setShowLiveInfo(true)}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          zIndex: 50,
          background: '#9768E1',
          color: '#FFFFFF',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '9999px',
          boxShadow: '0 10px 20px rgba(151,104,225,0.35)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#9768E1'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#9768E1'; }}
      >
        Live Assessment
      </button>

      {/* Modal popup for link and password */}
      {showLiveInfo && (
        <div
          onClick={() => setShowLiveInfo(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(92vw, 520px)',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '20px 20px 16px 20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Live Assessment Access</h3>
              <button
                onClick={() => setShowLiveInfo(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: '8px 0' }}>
                <strong>Link:</strong> <a href={liveInfo.link} target="_blank" rel="noreferrer">{liveInfo.link}</a>
              </p>
              <p style={{ margin: '8px 0' }}>
                <strong>Password:</strong> {liveInfo.password}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <a
                href={liveInfo.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px'
                }}
              >
                Open Link
              </a>
              <button
                onClick={() => setShowLiveInfo(false)}
                style={{
                  background: '#F3F4F6',
                  color: '#111827',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="assessments-grid">
        {filteredAssessments.map(assessment => (
          <div key={assessment.id} className="assessment-card">
            <div className="card-header">
              <h3>{assessment.title}</h3>
              <span className={`status-badge ${assessment.status}`}>
                {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
              </span>
            </div>
            
            <div className="card-body">
              <p><strong>Subject:</strong> {assessment.subject}</p>
              <p><strong>Start Time:</strong> {assessment.startTime}</p>
              <p><strong>Duration:</strong> {assessment.duration}</p>
              <p><strong>Instructions:</strong> {assessment.instructions}</p>
            </div>
            
            <div className="card-actions">
              {assessment.status === 'active' && (
                <button 
                  className="attend-btn"
                  onClick={() => handleAttendTest(assessment.id)}
                >
                  Attend Test
                </button>
              )}
              
              {assessment.status === 'completed' && (
                <button 
                  className="results-btn"
                  onClick={() => handleViewResults(assessment.id)}
                >
                  View Results
                </button>
              )}
              
              {assessment.status === 'upcoming' && (
                <button className="upcoming-btn" disabled>
                  Upcoming
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;