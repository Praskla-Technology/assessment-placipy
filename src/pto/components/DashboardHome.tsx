import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBuilding, 
  FaClipboardList, 
  FaCalendarAlt
} from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    activeAssessments: 0,
    totalStudents: 0,
    totalDepartments: 0,
    completedToday: 0
  });
  const [departmentPerformanceData, setDepartmentPerformanceData] = useState<Array<{ name: string; students: number; avgScore: number; completed: number }>>([]);
  const [assessments, setAssessments] = useState<Array<{ id: number; title: string; subject: string; startTime: string; duration: string; status: 'ongoing' | 'upcoming' }>>([]);

  // Simulate loading data dynamically
  useEffect(() => {
    const loadStats = () => {
      setStats({
        totalAssessments: 24,
        activeAssessments: 8,
        totalStudents: 1560,
        totalDepartments: 5,
        completedToday: 23
      });
      setDepartmentPerformanceData([
        { name: 'CS', students: 450, avgScore: 82, completed: 380 },
        { name: 'ECE', students: 380, avgScore: 75, completed: 320 },
        { name: 'ME', students: 420, avgScore: 79, completed: 360 },
        { name: 'CE', students: 310, avgScore: 73, completed: 280 },
      ]);
      setAssessments([
        { id: 1, title: 'JavaScript Fundamentals', subject: 'CSE', startTime: '2025-11-15 10:00 AM', duration: '60 mins', status: 'ongoing' },
        { id: 2, title: 'Data Structures Quiz', subject: 'IT', startTime: '2025-11-20 02:00 PM', duration: '45 mins', status: 'upcoming' },
        { id: 3, title: 'Circuit Theory Test', subject: 'ECE', startTime: '2025-11-16 11:00 AM', duration: '90 mins', status: 'ongoing' },
        { id: 4, title: 'Thermodynamics Midterm', subject: 'ME', startTime: '2025-11-25 09:00 AM', duration: '120 mins', status: 'upcoming' },
      ]);
    };

    setTimeout(loadStats, 500);
  }, []);

  // KPI Cards matching PRD overview
  const kpiCards = [
    { 
      label: 'TOTAL STUDENTS', 
      value: stats.totalStudents, 
      change: 'Across all departments',
      icon: FaUsers
    },
    { 
      label: 'DEPARTMENTS', 
      value: stats.totalDepartments, 
      change: 'Active departments',
      icon: FaBuilding
    },
    { 
      label: 'TOTAL ASSESSMENTS', 
      value: stats.totalAssessments, 
      change: '+4 from last month',
      icon: FaClipboardList
    },
    { 
      label: 'ACTIVE ASSESSMENTS', 
      value: stats.activeAssessments, 
      change: 'Currently running',
      icon: FaCalendarAlt
    },
  ];

  return (
    <div className="pto-dashboard-home">
      {/* Welcome Banner - PTO Dashboard */}
      <div className="pto-welcome-banner">
        <div className="pto-welcome-content">
          <h1 className="pto-welcome-title">Welcome to PTO Dashboard</h1>
          <p className="pto-welcome-subtitle">
            Manage Departments, Staff, Assessments & Student Performance.
          </p>
        </div>
      </div>

      {/* KPI Cards - Matching Image Style */}
      <div className="pto-kpi-section">
        <div className="pto-kpi-grid">
          {kpiCards.map((card, index) => (
            <div key={index} className="pto-kpi-card">
              <div className="pto-kpi-label">{card.label}</div>
              <div className="pto-kpi-value">{card.value}</div>
              <div className="pto-kpi-change">{card.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Performance Analytics */}
      <div className="pto-analytics-section">
        <h2 className="pto-section-title">Performance by Department</h2>
        <div className="pto-chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#9768E1" name="Total Students" />
              <Bar dataKey="avgScore" fill="#E4D5F8" name="Avg Score" />
              <Bar dataKey="completed" fill="#A4878D" name="Completed Tests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tests Overview */}
      <div className="tests-section">
        <div className="tests-column">
          <h2 className="pto-section-title">Ongoing Tests</h2>
          <div className="tests-list">
            {assessments.filter(a => a.status === 'ongoing').map(test => (
              <div key={test.id} className="test-card ongoing">
                <div className="test-icon">
                  <FaCalendarAlt size={18} color="#9768E1" />
                </div>
                <div className="test-content">
                  <div className="test-name">{test.title}</div>
                  <div className="test-detail"><strong>Department:</strong> {test.subject}</div>
                  <div className="test-date"><strong>Started:</strong> {test.startTime}</div>
                  <div className="test-duration"><strong>Duration:</strong> {test.duration}</div>
                </div>
              </div>
            ))}
            {assessments.filter(a => a.status === 'ongoing').length === 0 && (
              <div className="pto-empty-state">No ongoing tests</div>
            )}
          </div>
        </div>
        <div className="tests-column">
          <h2 className="pto-section-title">Upcoming Tests</h2>
          <div className="tests-list">
            {assessments.filter(a => a.status === 'upcoming').map(test => (
              <div key={test.id} className="test-card">
                <div className="test-icon">
                  <FaCalendarAlt size={18} color="#9768E1" />
                </div>
                <div className="test-content">
                  <div className="test-name">{test.title}</div>
                  <div className="test-detail"><strong>Department:</strong> {test.subject}</div>
                  <div className="test-date"><strong>Starts:</strong> {test.startTime}</div>
                  <div className="test-duration"><strong>Duration:</strong> {test.duration}</div>
                </div>
              </div>
            ))}
            {assessments.filter(a => a.status === 'upcoming').length === 0 && (
              <div className="pto-empty-state">No upcoming tests</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;

