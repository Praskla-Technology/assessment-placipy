import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Download } from 'lucide-react';
import AnalyticsService from '../services/analytics.service';

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
  const [departmentChartData, setDepartmentChartData] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<StudentPerformance[]>([]);
  const [assessmentAnalytics, setAssessmentAnalytics] = useState<AssessmentAnalytics[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch PTS overview data
        const overviewResponse = await AnalyticsService.getPTSOverview();
        const overviewData = overviewResponse.data || {};
        
        // Set department stats
        const deptStats = overviewData.departmentStats || [];
        setDepartmentStats(deptStats);
        
        // Create chart data for PieChart
        const chartData = deptStats.map((dept: any) => ({
          name: dept.department,
          value: dept.totalStudents
        }));
        setDepartmentChartData(chartData);
        
        // Set top performers
        setTopPerformers(overviewData.topPerformers || []);
        
        // Set assessment analytics
        setAssessmentAnalytics(overviewData.recentAssessments || []);
        
        // Create performance trends data
        // For now, we'll create mock trend data based on the average score
        const avgScore = overviewData.overview?.avgScore || 0;
        const trendData = [
          { month: 'Jan', averageScore: Math.max(0, avgScore - 15) },
          { month: 'Feb', averageScore: Math.max(0, avgScore - 12) },
          { month: 'Mar', averageScore: Math.max(0, avgScore - 8) },
          { month: 'Apr', averageScore: Math.max(0, avgScore - 5) },
          { month: 'May', averageScore: Math.max(0, avgScore - 2) },
          { month: 'Jun', averageScore: avgScore }
        ];
        setPerformanceTrends(trendData);
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        setError(error.message || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getOverallStats = () => {
    const totalStudents = departmentStats.reduce((sum, dept) => sum + dept.totalStudents, 0);
    const totalActive = departmentStats.reduce((sum, dept) => sum + dept.activeStudents, 0);
    const totalAssessments = departmentStats.reduce((sum, dept) => sum + dept.assessmentsCompleted, 0);
    const avgScore = departmentStats.length > 0 ? departmentStats.reduce((sum, dept) => sum + dept.averageScore, 0) / departmentStats.length : 0;
    
    return {
      totalStudents,
      totalActive,
      totalAssessments,
      avgScore: Math.round(avgScore * 10) / 10,
      participationRate: totalStudents > 0 ? Math.round((totalActive / totalStudents) * 100 * 10) / 10 : 0
    };
  };

  const overallStats = getOverallStats();

  const COLORS = ['#9768E1', '#523C48', '#A4878D', '#E4D5F8', '#D0BFE7'];

  const handleExportStudents = () => {
    try {
      // Create CSV content
      let csvContent = "Department,Total Students,Active Students,Average Score,Assessments Completed\n";
      
      departmentStats.forEach(dept => {
        csvContent += `${dept.department},${dept.totalStudents},${dept.activeStudents},${dept.averageScore},${dept.assessmentsCompleted}\n`;
      });
      
      // Add top performers section
      csvContent += "\nTop Performers\n";
      csvContent += "Rank,Name,Roll No,Department,Average Score,Assessments Taken\n";
      
      topPerformers.forEach(student => {
        csvContent += `${student.rank},${student.name},${student.rollNo},${student.department},${student.averageScore},${student.assessmentsTaken}\n`;
      });
      
      // Add assessment analytics section
      csvContent += "\nAssessment Analytics\n";
      csvContent += "Assessment Title,Date,Participants,Average Score,Highest Score,Lowest Score\n";
      
      assessmentAnalytics.forEach(assessment => {
        csvContent += `${assessment.assessmentTitle},${assessment.date},${assessment.totalParticipants},${assessment.averageScore},${assessment.highestScore},${assessment.lowestScore}\n`;
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'student_analytics.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

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
                data={departmentChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name ? name.substring(0,3) : 'N/A'}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
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

  if (loading) {
    return (
      <div className="pts-fade-in" style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pts-fade-in" style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <div>Error loading analytics: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: "10px", padding: "8px 16px", backgroundColor: "#9768E1", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

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
          {/* Export Button */}
          <button className="pts-btn-secondary" onClick={handleExportStudents} style={{ marginBottom: "10px", marginLeft: "auto" }}>
            <Download size={18} /> Export Data
          </button>
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