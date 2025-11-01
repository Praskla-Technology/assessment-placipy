import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAssessments: 0,
    activeAssessments: 0,
    totalStudents: 0,
    completedToday: 0
  });

  const [recentActivities] = useState([
    { id: 1, action: "New assessment 'React Fundamentals' created", time: "2 hours ago", type: "creation" },
    { id: 2, action: "Assessment 'JavaScript Basics' scheduled for CSE batch", time: "3 hours ago", type: "schedule" },
    { id: 3, action: "45 students completed 'Python Quiz'", time: "5 hours ago", type: "completion" },
    { id: 4, action: "Analytics report generated for October", time: "1 day ago", type: "report" },
  ]);

  const [quickActions] = useState([
    {
      title: "Create New Assessment",
      description: "Design and create a new assessment with questions and settings",
      action: "create",
      icon: "📝"
    },
    {
      title: "Schedule Assessment", 
      description: "Schedule existing assessments for specific batches and dates",
      action: "schedule",
      icon: "📅"
    },
    {
      title: "View Analytics",
      description: "Analyze student performance and generate detailed reports",
      action: "stats", 
      icon: "📊"
    },
    {
      title: "Manage Students",
      description: "View and manage student enrollments and batch assignments",
      action: "students",
      icon: "👥"
    }
  ]);

  // Simulate loading data
  useEffect(() => {
    const loadStats = () => {
      setStats({
        totalAssessments: 24,
        activeAssessments: 8,
        totalStudents: 156,
        completedToday: 23
      });
    };

    setTimeout(loadStats, 500);
  }, []);

  const handleQuickAction = (action: string) => {
    // Navigate to respective pages using React Router
    console.log(`Quick action: ${action}`);
    
    switch(action) {
      case 'create':
        navigate('/pts/create');
        break;
      case 'schedule':
        navigate('/pts/schedule');
        break;
      case 'stats':
        navigate('/pts/stats');
        break;
      default:
        alert(`${action} functionality coming soon!`);
    }
  };

  return (
    <div className="pts-fade-in">
      {/* Welcome Banner */}
      <div className="pts-welcome-container">
        <h1>Welcome to PTS Dashboard</h1>
        <p>Manage assessments, track student progress, and generate insights for better placement training.</p>
      </div>

      {/* Statistics Cards */}
      <div className="pts-stats-grid">
        <div className="pts-stat-card">
          <h3>Total Assessments</h3>
          <div className="pts-stat-value">{stats.totalAssessments}</div>
          <div className="pts-stat-change">+4 from last month</div>
        </div>
        <div className="pts-stat-card">
          <h3>Active Assessments</h3>
          <div className="pts-stat-value">{stats.activeAssessments}</div>
          <div className="pts-stat-change">Currently running</div>
        </div>
        <div className="pts-stat-card">
          <h3>Enrolled Students</h3>
          <div className="pts-stat-value">{stats.totalStudents}</div>
          <div className="pts-stat-change">Across all batches</div>
        </div>
        <div className="pts-stat-card">
          <h3>Completed Today</h3>
          <div className="pts-stat-value">{stats.completedToday}</div>
          <div className="pts-stat-change">Assessment submissions</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pts-actions-section">
        <h2>Quick Actions</h2>
        <div className="pts-actions-grid">
          {quickActions.map((action, index) => (
            <div key={index} className="pts-action-card" onClick={() => handleQuickAction(action.action)}>
              <h3>{action.icon} {action.title}</h3>
              <p>{action.description}</p>
              <button className="pts-action-btn">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pts-activity-section">
        <h2>Recent Activity</h2>
        <div className="pts-activity-list">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="pts-activity-item">
              <div className="pts-activity-info">
                <h4>{activity.action}</h4>
                <p>Activity type: {activity.type}</p>
              </div>
              <div className="pts-activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;