import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  type?: 'assessment' | 'mcq' | 'coding' | 'header';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'assessment', count = 1 }) => {
  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'header':
        return (
          <div className="skeleton-loader" key={index}>
            <div className="skeleton-header">
              <div className="skeleton-timer"></div>
              <div className="skeleton-header-controls">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
                <div className="skeleton-language-selector"></div>
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          </div>
        );
      
      case 'mcq':
        return (
          <div className="skeleton-loader" key={index}>
            <div className="skeleton-section">
              <div className="skeleton-title"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-content-medium"></div>
              <div className="skeleton-content-short"></div>
              
              <div className="skeleton-options">
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
              </div>
              
              <div className="skeleton-progress"></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div className="skeleton-nav-btn"></div>
                <div className="skeleton-nav-btn"></div>
              </div>
            </div>
          </div>
        );
      
      case 'coding':
        return (
          <div className="skeleton-loader" key={index}>
            <div className="skeleton-section">
              <div className="skeleton-title"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-content-medium"></div>
              
              <div style={{ display: 'flex', gap: '2%', marginTop: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton-content" style={{ height: '20px', marginBottom: '10px' }}></div>
                  <div className="skeleton-content-medium" style={{ height: '20px', marginBottom: '10px' }}></div>
                  <div className="skeleton-content-short" style={{ height: '20px', marginBottom: '10px' }}></div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <div className="skeleton-option" style={{ height: '40px', flex: 1 }}></div>
                    <div className="skeleton-option" style={{ height: '40px', flex: 1 }}></div>
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div className="skeleton-editor"></div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div className="skeleton-nav-btn"></div>
                <div className="skeleton-nav-btn"></div>
                <div className="skeleton-nav-btn"></div>
              </div>
            </div>
          </div>
        );
      
      case 'assessment':
      default:
        return (
          <div className="skeleton-loader" key={index}>
            <div className="skeleton-header">
              <div className="skeleton-timer"></div>
              <div className="skeleton-header-controls">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
                <div className="skeleton-language-selector"></div>
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
            
            <div className="skeleton-section">
              <div className="skeleton-title"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-content-medium"></div>
              <div className="skeleton-content-short"></div>
              
              <div className="skeleton-options">
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
                <div className="skeleton-option"></div>
              </div>
              
              <div className="skeleton-progress"></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <div className="skeleton-nav-btn"></div>
                <div className="skeleton-nav-btn"></div>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // Render the skeleton components
    return Array.from({ length: count }, (_, index) => renderSkeleton(index));
  }

// Skeleton for dashboard stats cards
const SkeletonStatsCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '12px' }}></div>
    <div className="skeleton-line" style={{ width: '40%', height: '30px' }}></div>
  </div>
);

// Skeleton for assessment cards
const SkeletonAssessmentCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-line" style={{ width: '100%', height: '24px', marginBottom: '16px' }}></div>
    <div className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '12px' }}></div>
    <div className="skeleton-line" style={{ width: '60%', height: '16px', marginBottom: '12px' }}></div>
    <div className="skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '16px' }}></div>
    <div className="skeleton-button" style={{ width: '70%', height: '40px' }}></div>
  </div>
);

// Skeleton for result table rows
const SkeletonResultRow: React.FC = () => (
  <div className="skeleton-row">
    <div className="skeleton-line" style={{ width: '40%', height: '20px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '20%', height: '20px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '20%', height: '20px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '20%', height: '20px', marginBottom: '8px' }}></div>
  </div>
);

// Skeleton for notification items
const SkeletonNotificationItem: React.FC = () => (
  <div className="skeleton-notification">
    <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '40%', height: '16px' }}></div>
  </div>
);

// Skeleton for profile form fields
const SkeletonProfileField: React.FC = () => (
  <div className="skeleton-field">
    <div className="skeleton-line" style={{ width: '30%', height: '16px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '100%', height: '40px' }}></div>
  </div>
);

// Skeleton for dashboard welcome banner
const SkeletonWelcomeBanner: React.FC = () => (
  <div className="skeleton-welcome-banner">
    <div className="skeleton-line" style={{ width: '40%', height: '28px', marginBottom: '16px' }}></div>
    <div className="skeleton-line" style={{ width: '60%', height: '20px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '50%', height: '18px' }}></div>
  </div>
);

// Skeleton for chart bars
const SkeletonChartBar: React.FC = () => (
  <div className="skeleton-chart-bar">
    <div className="skeleton-line" style={{ width: '60px', height: '120px', marginBottom: '8px' }}></div>
    <div className="skeleton-line" style={{ width: '50px', height: '16px' }}></div>
  </div>
);

// Main skeleton wrapper component
interface SkeletonWrapperProps {
  children?: React.ReactNode;
  loading: boolean;
  type?: 'stats' | 'assessment' | 'result' | 'notification' | 'profile' | 'welcome' | 'chart' | 'custom';
  count?: number;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({ 
  children, 
  loading, 
  type = 'custom', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonStatsCard key={`stats-${index}`} />
        ));
      case 'assessment':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonAssessmentCard key={`assessment-${index}`} />
        ));
      case 'result':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonResultRow key={`result-${index}`} />
        ));
      case 'notification':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonNotificationItem key={`notification-${index}`} />
        ));
      case 'profile':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonProfileField key={`profile-${index}`} />
        ));
      case 'welcome':
        return <SkeletonWelcomeBanner key="welcome" />;
      case 'chart':
        return Array.from({ length: count }).map((_, index) => (
          <SkeletonChartBar key={`chart-${index}`} />
        ));
      default:
        return <div className="skeleton-generic" key="generic"></div>;
    }
  };

  return (
    <div>
      {loading ? renderSkeleton() : children}
    </div>
  );
};

export default SkeletonLoader;
