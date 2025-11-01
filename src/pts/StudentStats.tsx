import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface StudentPerformance {
  id: number;
  name: string;
  rollNo: string;
  department: string;
  batch: string;
  assessmentsTaken: number;
  averageScore: number;
  totalMarks: number;
  rank: number;
  lastActive: string;
}

interface DepartmentStats {
  department: string;
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  assessmentsCompleted: number;
  participationRate: number;
}

interface AssessmentAnalytics {
  assessmentTitle: string;
  date: string;
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}

const StudentStats: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'departments' | 'assessments' | 'students'>('overview');
  
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [topPerformers, setTopPerformers] = useState<StudentPerformance[]>([]);
  const [assessmentAnalytics, setAssessmentAnalytics] = useState<AssessmentAnalytics[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<any[]>([]);

  // Mock data initialization
  useEffect(() => {
    // Department Statistics
    setDepartmentStats([
      { department: "Computer Science", totalStudents: 120, activeStudents: 115, averageScore: 82.5, assessmentsCompleted: 45, participationRate: 95.8 },
      { department: "Information Technology", totalStudents: 100, activeStudents: 94, averageScore: 79.3, assessmentsCompleted: 38, participationRate: 94.0 },
      { department: "Electronics", totalStudents: 80, activeStudents: 76, averageScore: 75.8, assessmentsCompleted: 32, participationRate: 95.0 },
      { department: "Mechanical", totalStudents: 90, activeStudents: 85, averageScore: 73.2, assessmentsCompleted: 28, participationRate: 94.4 },
      { department: "Civil", totalStudents: 70, activeStudents: 66, averageScore: 71.5, assessmentsCompleted: 25, participationRate: 94.3 }
    ]);

    // Top Performers
    setTopPerformers([
      { id: 1, name: "Ananya Sharma", rollNo: "CSE21001", department: "Computer Science", batch: "CSE-2021-A", assessmentsTaken: 12, averageScore: 95.2, totalMarks: 1428, rank: 1, lastActive: "2 hours ago" },
      { id: 2, name: "Rahul Kumar", rollNo: "IT21005", department: "Information Technology", batch: "IT-2021-A", assessmentsTaken: 10, averageScore: 92.8, totalMarks: 1392, rank: 2, lastActive: "1 day ago" },
      { id: 3, name: "Priya Singh", rollNo: "CSE21045", department: "Computer Science", batch: "CSE-2021-B", assessmentsTaken: 11, averageScore: 91.5, totalMarks: 1373, rank: 3, lastActive: "3 hours ago" },
      { id: 4, name: "Arjun Patel", rollNo: "ECE21012", department: "Electronics", batch: "ECE-2021-A", assessmentsTaken: 9, averageScore: 90.1, totalMarks: 1351, rank: 4, lastActive: "5 hours ago" },
      { id: 5, name: "Sneha Reddy", rollNo: "IT21023", department: "Information Technology", batch: "IT-2021-B", assessmentsTaken: 10, averageScore: 89.7, totalMarks: 1345, rank: 5, lastActive: "1 hour ago" }
    ]);

    // Assessment Analytics
    setAssessmentAnalytics([
      { assessmentTitle: "React Fundamentals", date: "2025-11-01", totalParticipants: 85, averageScore: 78.5, highestScore: 98, lowestScore: 45, completionRate: 94.4 },
      { assessmentTitle: "JavaScript Basics", date: "2025-10-28", totalParticipants: 92, averageScore: 82.3, highestScore: 96, lowestScore: 52, completionRate: 97.9 },
      { assessmentTitle: "Database Management", date: "2025-10-25", totalParticipants: 67, averageScore: 75.2, highestScore: 94, lowestScore: 38, completionRate: 91.8 },
      { assessmentTitle: "Data Structures", date: "2025-10-22", totalParticipants: 78, averageScore: 71.8, highestScore: 92, lowestScore: 41, completionRate: 89.7 },
      { assessmentTitle: "Network Security", date: "2025-10-19", totalParticipants: 55, averageScore: 79.6, highestScore: 97, lowestScore: 48, completionRate: 96.5 }
    ]);

    // Performance Trends (last 6 months)
    setPerformanceTrends([
      { month: "Jun", averageScore: 72.5, participationRate: 89.2, assessments: 8 },
      { month: "Jul", averageScore: 74.8, participationRate: 91.5, assessments: 12 },
      { month: "Aug", averageScore: 76.2, participationRate: 93.1, assessments: 15 },
      { month: "Sep", averageScore: 78.9, participationRate: 94.7, assessments: 18 },
      { month: "Oct", averageScore: 81.3, participationRate: 95.8, assessments: 22 },
      { month: "Nov", averageScore: 83.1, participationRate: 96.2, assessments: 25 }
    ]);
  }, []);

  const getOverallStats = () => {
    const totalStudents = departmentStats.reduce((sum, dept) => sum + dept.totalStudents, 0);
    const totalActive = departmentStats.reduce((sum, dept) => sum + dept.activeStudents, 0);
    const totalAssessments = departmentStats.reduce((sum, dept) => sum + dept.assessmentsCompleted, 0);
    const avgScore = departmentStats.reduce((sum, dept) => sum + dept.averageScore, 0) / departmentStats.length;
    
    return {
      totalStudents,
      totalActive,
      totalAssessments,
      avgScore: Math.round(avgScore * 10) / 10,
      participationRate: Math.round((totalActive / totalStudents) * 100 * 10) / 10
    };
  };

  const overallStats = getOverallStats();

  const COLORS = ['#9768E1', '#523C48', '#A4878D', '#E4D5F8', '#D0BFE7'];

  const renderOverviewTab = () => (
    <div className="pts-fade-in">
      {/* Key Metrics */}
      <div className="pts-stats-grid">
        <div className="pts-stat-card">
          <h3>Total Students</h3>
          <div className="pts-stat-value">{overallStats.totalStudents}</div>
          <div className="pts-stat-change">Across all departments</div>
        </div>
        <div className="pts-stat-card">
          <h3>Active Students</h3>
          <div className="pts-stat-value">{overallStats.totalActive}</div>
          <div className="pts-stat-change">{overallStats.participationRate}% participation</div>
        </div>
        <div className="pts-stat-card">
          <h3>Total Assessments</h3>
          <div className="pts-stat-value">{overallStats.totalAssessments}</div>
          <div className="pts-stat-change">This semester</div>
        </div>
        <div className="pts-stat-card">
          <h3>Average Score</h3>
          <div className="pts-stat-value">{overallStats.avgScore}%</div>
          <div className="pts-stat-change">All departments</div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="pts-form-container">
        <h3 className="pts-form-title">Performance Trends (6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="averageScore" stackId="1" stroke="#9768E1" fill="#9768E1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Department Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="pts-form-container">
          <h3 className="pts-form-title">Student Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.department.substring(0,3)}: ${entry.totalStudents}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalStudents"
              >
                {departmentStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pts-form-container">
          <h3 className="pts-form-title">Top Performers</h3>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {topPerformers.slice(0, 5).map((student, index) => (
              <div key={student.id} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #e9ecef",
                backgroundColor: index < 3 ? "#f8f9fa" : "transparent"
              }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#523C48" }}>
                    #{student.rank} {student.name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>
                    {student.department} • {student.rollNo}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "600", color: "#9768E1" }}>
                    {student.averageScore}%
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>
                    {student.assessmentsTaken} tests
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDepartmentsTab = () => (
    <div className="pts-fade-in">
      <div className="pts-form-container">
        <h3 className="pts-form-title">Department Performance Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="averageScore" fill="#9768E1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pts-stats-grid">
        {departmentStats.map((dept, index) => (
          <div key={index} className="pts-stat-card">
            <h3>{dept.department}</h3>
            <div className="pts-stat-value">{dept.averageScore}%</div>
            <div className="pts-stat-change">
              {dept.activeStudents}/{dept.totalStudents} active students
            </div>
            <div style={{ fontSize: "0.9rem", color: "#A4878D", marginTop: "5px" }}>
              {dept.assessmentsCompleted} assessments completed
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssessmentsTab = () => (
    <div className="pts-fade-in">
      <div className="pts-form-container">
        <h3 className="pts-form-title">Recent Assessment Analytics</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {assessmentAnalytics.map((assessment, index) => (
            <div key={index} style={{
              background: "white",
              padding: "20px", 
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ color: "#523C48", margin: "0 0 10px 0" }}>
                    {assessment.assessmentTitle}
                  </h4>
                  <p style={{ color: "#A4878D", margin: "0", fontSize: "0.9rem" }}>
                    Date: {new Date(assessment.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#9768E1", fontWeight: "600", fontSize: "1.2rem" }}>
                    {assessment.averageScore}%
                  </div>
                  <div style={{ color: "#A4878D", fontSize: "0.85rem" }}>
                    Average Score
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                gap: "15px",
                marginTop: "15px",
                paddingTop: "15px",
                borderTop: "1px solid #e9ecef"
              }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#523C48" }}>{assessment.totalParticipants}</div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>Participants</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#28a745" }}>{assessment.highestScore}%</div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>Highest Score</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#dc3545" }}>{assessment.lowestScore}%</div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>Lowest Score</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#9768E1" }}>{assessment.completionRate}%</div>
                  <div style={{ fontSize: "0.85rem", color: "#A4878D" }}>Completion Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pts-fade-in">
      {/* Tab Navigation */}
      <div className="pts-form-container">
        <div style={{ display: "flex", gap: "10px", marginBottom: "0", flexWrap: "wrap" }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'departments', label: 'Departments' },
            { key: 'assessments', label: 'Assessment Analytics' },
          ].map(tab => (
            <button
              key={tab.key}
              className={selectedView === tab.key ? "pts-btn-primary" : "pts-btn-secondary"}
              onClick={() => setSelectedView(tab.key as any)}
              style={{ marginBottom: "10px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {selectedView === 'overview' && renderOverviewTab()}
      {selectedView === 'departments' && renderDepartmentsTab()}
      {selectedView === 'assessments' && renderAssessmentsTab()}
    </div>
  );
};

export default StudentStats;