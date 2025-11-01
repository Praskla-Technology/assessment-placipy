import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardHome: React.FC = () => {
  // Dummy data
  const stats = [
    { title: 'Total Colleges', value: 24, icon: '🏫' },
    { title: 'Total Officers', value: 48, icon: '👤' },
    { title: 'Total Students', value: 3240, icon: '🎓' },
    { title: 'Active Assessments', value: 156, icon: '📝' },
  ];

  const topColleges = [
    { name: 'KSR College', assessments: 145, students: 850 },
    { name: 'SNS College', assessments: 132, students: 720 },
    { name: 'PSG College', assessments: 128, students: 680 },
    { name: 'KCT College', assessments: 115, students: 590 },
    { name: 'Kumaraguru', assessments: 98, students: 520 },
  ];

  const chartData = topColleges.map(college => ({
    name: college.name,
    Assessments: college.assessments,
    Students: Math.floor(college.students / 10), // Scale down for better visualization
  }));

  return (
    <div className="admin-dashboard-home">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div className="admin-stat-card" key={index}>
            <div className="admin-stat-icon">{stat.icon}</div>
            <div className="admin-stat-content">
              <h3 className="admin-stat-title">{stat.title}</h3>
              <p className="admin-stat-value">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="admin-chart-section">
        <div className="admin-chart-card">
          <h2 className="admin-section-title">Top 5 Active Colleges</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0BFE7" />
              <XAxis 
                dataKey="name" 
                stroke="#523C48"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <YAxis 
                stroke="#523C48"
                style={{ fontSize: '12px', fontWeight: 500 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FBFAFB', 
                  border: '1px solid #D0BFE7',
                  borderRadius: '8px',
                  color: '#523C48'
                }}
              />
              <Legend />
              <Bar dataKey="Assessments" fill="#9768E1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Students" fill="#E4D5F8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

