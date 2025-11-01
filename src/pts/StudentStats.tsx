import React from "react";

const StudentStats: React.FC = () => {
  const stats = [
    { label: "Total Students", value: 240 },
    { label: "Participated", value: 215 },
    { label: "Average Score", value: "78%" },
    { label: "Top Performer", value: "Ananya S" },
  ];

  const departments = [
    { name: "CSE", avg: 82, participants: 75 },
    { name: "ECE", avg: 76, participants: 62 },
    { name: "EEE", avg: 71, participants: 58 },
    { name: "IT", avg: 80, participants: 65 },
  ];

  const styles = {
    container: {
      backgroundColor: "#FBFAFB",
      minHeight: "100vh",
      padding: "2rem",
      color: "#523C48",
      fontFamily: "Segoe UI, sans-serif",
    },
    header: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: "#523C48",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    },
    statCard: {
      backgroundColor: "#E4D5F8",
      border: "1px solid #D0BFE7",
      borderRadius: "15px",
      padding: "1.2rem",
      textAlign: "center" as const,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      transition: "transform 0.3s ease",
    },
    statValue: {
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "#9768E1",
    },
    statLabel: {
      fontSize: "1rem",
      color: "#523C48",
      marginTop: "0.4rem",
    },
    deptContainer: {
      marginTop: "1.5rem",
      backgroundColor: "#E4D5F8",
      border: "1px solid #D0BFE7",
      borderRadius: "15px",
      padding: "1.5rem",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    },
    deptHeader: {
      fontSize: "1.4rem",
      fontWeight: 600,
      marginBottom: "1rem",
      color: "#523C48",
      textAlign: "center" as const,
    },
    deptTable: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    th: {
      textAlign: "left" as const,
      padding: "0.75rem",
      backgroundColor: "#D0BFE7",
      color: "#523C48",
      borderBottom: "2px solid #9768E1",
    },
    td: {
      padding: "0.75rem",
      borderBottom: "1px solid #D0BFE7",
      color: "#523C48",
    },
    footer: {
      marginTop: "2rem",
      textAlign: "center" as const,
      fontSize: "0.9rem",
      color: "#A4878D",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Student Performance Analytics</h2>

      <div style={styles.statsContainer}>
        {stats.map((s, index) => (
          <div
            key={index}
            style={{
              ...styles.statCard,
              ...(index % 2 === 0 ? { backgroundColor: "#D0BFE7" } : {}),
            }}
          >
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.deptContainer}>
        <h3 style={styles.deptHeader}>Department-wise Summary</h3>
        <table style={styles.deptTable}>
          <thead>
            <tr>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Avg. Score</th>
              <th style={styles.th}>Participants</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={index}>
                <td style={styles.td}>{dept.name}</td>
                <td style={styles.td}>{dept.avg}%</td>
                <td style={styles.td}>{dept.participants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={styles.footer}>Updated on {new Date().toLocaleDateString()}</p>
    </div>
  );
};

export default StudentStats;
