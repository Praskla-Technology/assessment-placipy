import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Download } from 'lucide-react';
import AnalyticsService from '../services/analytics.service';
import { useUser } from '../contexts/UserContext';

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



interface AssessmentAnalytics {
  assessmentTitle: string;
  date: string;
  totalParticipants: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
  email?: string;
  studentEmail?: string;
  assessmentId?: string;
  submittedAt?: string;
  percentage?: number;
  score?: number;
  maxScore?: number;
  Name?: string;
  department?: string;
  rollNumber?: string;
  studentEmails?: string;
}

const StudentStats: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'assessments'>('overview');
  
  const [topPerformers, setTopPerformers] = useState<StudentPerformance[]>([]);
  const [assessmentAnalytics, setAssessmentAnalytics] = useState<AssessmentAnalytics[]>([]);
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<any>({});
  // Performance trends are no longer needed for the new assessment participation chart
  // The assessmentAnalytics data will be used directly for the new chart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, loading: userLoading } = useUser();

  // Fetch real data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Wait for user context to be loaded
      if (userLoading) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch student analytics data
        const analyticsResponse = await AnalyticsService.getStudentAnalytics();
        const analyticsData = analyticsResponse.data || {};
        
        // Process the analytics data from the updated endpoint
        
        // Set top performers
        setTopPerformers(analyticsData.topPerformers || []);
        
        // Set assessment analytics
        setAssessmentAnalytics(analyticsData.assessments || []);
        
        // Set raw results for attempt report
        setRawResults(analyticsData.rawResults || []);
        
        // Store the analytics summary data from backend
        setAnalyticsSummary(analyticsData);
        

        
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        setError(error.message || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userLoading]);

  const getOverallStats = () => {
    // Use data directly from the backend analytics response
    // The backend already returns the correct aggregated data
    
    // Use values from backend if available, otherwise calculate from frontend data
    const totalStudents = analyticsSummary.totalStudents || topPerformers.length;
    const totalActive = analyticsSummary.activeStudents || topPerformers.filter(student => student.assessmentsTaken > 0).length;
    const totalAssessments = analyticsSummary.totalAssessments || topPerformers.reduce((sum, student) => sum + student.assessmentsTaken, 0);
    const avgScore = analyticsSummary.avgScore || (totalActive > 0 ? topPerformers.reduce((sum, student) => sum + (student.averageScore || 0), 0) / totalActive : 0);
    
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
      let csvContent = "Name,Roll No,Department,Average Score,Assessments Taken\n";
      
      topPerformers.forEach(student => {
        csvContent += `${student.name},${student.rollNo},${student.department},${student.averageScore},${student.assessmentsTaken}\n`;
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
          <div className="pts-stat-change">All students</div>
        </div>
        <div className="pts-stat-card">
          <h3>Active Students</h3>
          <div className="pts-stat-value">{overallStats.totalActive}</div>
          <div className="pts-stat-change">{overallStats.participationRate}% of total</div>
        </div>
        <div className="pts-stat-card">
          <h3>Total Assessments</h3>
          <div className="pts-stat-value">{overallStats.totalAssessments}</div>
          <div className="pts-stat-change">Taken by students</div>
        </div>
        <div className="pts-stat-card">
          <h3>Average Score</h3>
          <div className="pts-stat-value">{overallStats.avgScore}%</div>
          <div className="pts-stat-change">Overall average</div>
        </div>
      </div>

      {/* Assessment Participation Trend */}
      <div className="pts-form-container">
        <h3 className="pts-form-title">Assessment Participation Trend</h3>
        <ResponsiveContainer width="100%" height={700}>
          <BarChart data={topPerformers.slice(0, 6)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
            <YAxis allowDecimals={false} domain={[0, 60]} interval={0} />
            <Tooltip />
            <Bar dataKey="assessmentsTaken" fill="#9768E1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
        <div className="pts-form-container">
          <h3 className="pts-form-title">Top Performers</h3>
          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {topPerformers.slice(0, 5).map((student: StudentPerformance, index: number) => (
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



  const renderAssessmentsTab = () => {
    // Calculate attempt report data
    const totalAttempts = rawResults.length;
    
    // Group attempts by student (email)
    const attemptsByStudent: Record<string, any[]> = {};
    rawResults.forEach((result: any) => {
      const email = result.email || result.studentEmail || 'Unknown';
      if (!attemptsByStudent[email]) {
        attemptsByStudent[email] = [];
      }
      attemptsByStudent[email].push(result);
    });
    
    // Group attempts by assessment
    const attemptsByAssessment: Record<string, any[]> = {};
    rawResults.forEach((result: any) => {
      const assessmentId = result.assessmentId || result.assessmentTitle || 'Unknown';
      if (!attemptsByAssessment[assessmentId]) {
        attemptsByAssessment[assessmentId] = [];
      }
      attemptsByAssessment[assessmentId].push(result);
    });
    
    // Group attempts by date (for trend analysis)
    const attemptsByDate: Record<string, any[]> = {};
    rawResults.forEach((result: any) => {
      const date = result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'Unknown';
      if (!attemptsByDate[date]) {
        attemptsByDate[date] = [];
      }
      attemptsByDate[date].push(result);
    });
    
    // Prepare data for charts
    const trendData = Object.entries(attemptsByDate)
      .map(([date, results]) => ({ date, count: results.length }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const studentData = Object.entries(attemptsByStudent)
      .map(([email, results]) => ({
        email,
        attempts: results.length,
        totalScore: results.reduce((sum, r) => sum + (r.percentage || 0), 0),
        averageScore: results.length > 0 ? 
          results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length : 0
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10); // Top 10 students
    
    const assessmentData = Object.entries(attemptsByAssessment)
      .map(([assessmentId, results]) => ({
        assessmentId,
        attempts: results.length,
        totalScore: results.reduce((sum, r) => sum + (r.percentage || 0), 0),
        averageScore: results.length > 0 ? 
          results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length : 0,
        studentEmails: [...new Set(results.map(r => r.email || r.studentEmail || 'Unknown'))].join(', ')
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10); // Top 10 assessments
    
    return (
      <div className="pts-fade-in">
        <div className="pts-form-container">
          <h3 className="pts-form-title">Attempt Report</h3>
          
          {/* Attempt Overview Stats - using PTO style */}
          <div className="stats-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div className="stat-card" style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef"
            }}>
              <h4>Total Attempts</h4>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Attempts:</span>
                  <span className="stat-value" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9768E1" }}>{totalAttempts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">All assessment attempts</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef"
            }}>
              <h4>Active Students</h4>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Students:</span>
                  <span className="stat-value" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9768E1" }}>{Object.keys(attemptsByStudent).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Who attempted assessments</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef"
            }}>
              <h4>Assessments</h4>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Assessments:</span>
                  <span className="stat-value" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9768E1" }}>{Object.keys(attemptsByAssessment).length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">With at least one attempt</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e9ecef"
            }}>
              <h4>Avg. Attempts/Student</h4>
              <div className="stat-details">
                <div className="stat-item">
                  <span className="stat-label">Rate:</span>
                  <span className="stat-value" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9768E1" }}>
                    {Object.keys(attemptsByStudent).length > 0 ? 
                      Math.round((totalAttempts / Object.keys(attemptsByStudent).length) * 100) / 100 : 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Per active student</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Attempt Trend Chart */}
          <h3 className="pts-form-title" style={{ marginTop: "30px" }}>Attempt Trend</h3>
          <div className="chart-container" style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            padding: "20px",
            marginBottom: "30px"
          }}>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#9768E1" fill="#E4D5F8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Attempts by Student */}
          <h3 className="pts-form-title" style={{ marginTop: "30px" }}>Top Students by Attempts</h3>
          <div className="table-container" style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            overflow: "hidden",
            marginBottom: "30px"
          }}>
            <table className="data-table" style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead style={{
                backgroundColor: "#9768E1",
                color: "white"
              }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>Student Email</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Attempts</th>

                </tr>
              </thead>
              <tbody>
                {studentData.length > 0 ? (
                  studentData.map((student, index) => (
                    <tr key={index} style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                      borderBottom: "1px solid #ddd"
                    }}>
                      <td style={{ padding: "12px" }}>{student.email}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{student.attempts}</td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{
                      padding: "40px",
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#A4878D"
                    }}>
                      No student attempts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Attempts by Assessment */}
          <h3 className="pts-form-title" style={{ marginTop: "30px" }}>Top Assessments by Attempts</h3>
          <div className="table-container" style={{
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
            overflow: "hidden"
          }}>
            <table className="data-table" style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead style={{
                backgroundColor: "#9768E1",
                color: "white"
              }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>Assessment ID</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Attempts</th>
                  <th style={{ padding: "12px", textAlign: "center" }}>Students</th>
                </tr>
              </thead>
              <tbody>
                {assessmentData.length > 0 ? (
                  assessmentData.map((assessment, index) => (
                    <tr key={index} style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                      borderBottom: "1px solid #ddd"
                    }}>
                      <td style={{ padding: "12px" }}>{assessment.assessmentId}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{assessment.attempts}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>{assessment.studentEmails || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{
                      padding: "40px",
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "#A4878D"
                    }}>
                      No assessment attempts recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
            { key: 'assessments', label: 'Attempt Report' },
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

      {selectedView === 'assessments' && renderAssessmentsTab()}
    </div>
  );
};

export default StudentStats;