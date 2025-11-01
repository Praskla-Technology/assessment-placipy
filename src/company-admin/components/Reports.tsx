import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  // Dummy data for charts
  const collegePerformance = [
    { name: 'KSR College', students: 850, assessments: 145, completion: 92 },
    { name: 'SNS College', students: 720, assessments: 132, completion: 88 },
    { name: 'PSG College', students: 680, assessments: 128, completion: 85 },
    { name: 'KCT College', students: 590, assessments: 115, completion: 90 },
    { name: 'Kumaraguru', students: 520, assessments: 98, completion: 87 },
  ];

  const assessmentStats = [
    { name: 'Jan', assessments: 45, completions: 1200 },
    { name: 'Feb', assessments: 52, completions: 1450 },
    { name: 'Mar', assessments: 48, completions: 1380 },
    { name: 'Apr', assessments: 61, completions: 1650 },
    { name: 'May', assessments: 55, completions: 1520 },
    { name: 'Jun', assessments: 58, completions: 1580 },
  ];

  const statusData = [
    { name: 'Completed', value: 3240, color: '#9768E1' },
    { name: 'In Progress', value: 450, color: '#E4D5F8' },
    { name: 'Pending', value: 210, color: '#D0BFE7' },
  ];

  const handleExportExcel = () => {
    // In real app, this would generate and download Excel file
    alert('Exporting to Excel... (UI only)');
  };

  const handleExportPDF = () => {
    // In real app, this would generate and download PDF file
    alert('Exporting to PDF... (UI only)');
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Reports & Analytics</h2>
        <div className="admin-export-buttons">
          <button className="admin-btn-export" onClick={handleExportExcel}>
            📊 Export Excel
          </button>
          <button className="admin-btn-export" onClick={handleExportPDF}>
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="admin-reports-grid">
        {/* College Performance Chart */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">College Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collegePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0BFE7" />
              <XAxis dataKey="name" stroke="#523C48" style={{ fontSize: '11px' }} />
              <YAxis stroke="#523C48" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBFAFB',
                  border: '1px solid #D0BFE7',
                  borderRadius: '8px',
                  color: '#523C48'
                }}
              />
              <Legend />
              <Bar dataKey="students" fill="#9768E1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="assessments" fill="#E4D5F8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Assessment Statistics */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Assessment Statistics (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assessmentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0BFE7" />
              <XAxis dataKey="name" stroke="#523C48" style={{ fontSize: '11px' }} />
              <YAxis stroke="#523C48" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBFAFB',
                  border: '1px solid #D0BFE7',
                  borderRadius: '8px',
                  color: '#523C48'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="assessments" stroke="#9768E1" strokeWidth={2} />
              <Line type="monotone" dataKey="completions" stroke="#E4D5F8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">Assessment Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Table */}
        <div className="admin-chart-card">
          <h3 className="admin-chart-title">College Completion Rates</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>College Name</th>
                  <th>Students</th>
                  <th>Assessments</th>
                  <th>Completion %</th>
                </tr>
              </thead>
              <tbody>
                {collegePerformance.map((college, index) => (
                  <tr key={index}>
                    <td>{college.name}</td>
                    <td>{college.students}</td>
                    <td>{college.assessments}</td>
                    <td>
                      <div className="admin-progress-container">
                        <div className="admin-progress-bar">
                          <div
                            className="admin-progress-fill"
                            style={{ width: `${college.completion}%` }}
                          ></div>
                        </div>
                        <span>{college.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

