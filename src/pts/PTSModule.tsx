import React, { useState } from "react";
import Dashboard from "./Dashboard";
import AssessmentCreation from "./AssessmentCreation";
import AssessmentScheduling from "./AssessmentScheduling";
import StudentStats from "./StudentStats";

const PTSModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  //Color Palette
  const colors = {
    background: "#FBFAFB",
    primary: "#9768E1",
    lightLavender: "#E4D5F8",
    neutral: "#A4878D",
    deepPlum: "#523C48",
    pastelLavender: "#D0BFE7",
  };

  // 🧭 Layout Styles
  const layoutStyle: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    backgroundColor: colors.background,
    fontFamily: "Inter, Arial, sans-serif",
  };

  // Sidebar
  const sidebarStyle: React.CSSProperties = {
    width: "240px",
    backgroundColor: colors.primary,
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "30px",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
  };

  const sidebarItemStyle = (tab: string): React.CSSProperties => ({
    width: "80%",
    padding: "12px 16px",
    margin: "6px 0",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: activeTab === tab ? colors.lightLavender : "transparent",
    color: activeTab === tab ? colors.deepPlum : "white",
    fontWeight: activeTab === tab ? "bold" : "normal",
    transition: "all 0.3s ease",
  });

  // Header
  const headerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    padding: "20px 30px",
    borderBottom: `1px solid ${colors.pastelLavender}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
  };

  const userInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: colors.deepPlum,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "25px",
    backgroundColor: colors.background,
  };

  return (
    <div style={layoutStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ marginBottom: "30px", fontWeight: 700 }}>PlaciPy PTS</h2>
        <div style={sidebarItemStyle("dashboard")} onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </div>
        <div style={sidebarItemStyle("create")} onClick={() => setActiveTab("create")}>
          Create Assessment
        </div>
        <div style={sidebarItemStyle("schedule")} onClick={() => setActiveTab("schedule")}>
          Scheduling
        </div>
        <div style={sidebarItemStyle("stats")} onClick={() => setActiveTab("stats")}>
          Student Stats
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ color: colors.deepPlum }}>Welcome back, John!</h3>
          <div style={userInfoStyle}>
            <img
              src="https://via.placeholder.com/40"
              alt="profile"
              style={{ borderRadius: "50%", border: `2px solid ${colors.primary}` }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>John Doe</div>
              <div style={{ fontSize: "13px", color: colors.neutral }}>3rd Year</div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={contentStyle}>
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "create" && <AssessmentCreation />}
          {activeTab === "schedule" && <AssessmentScheduling />}
          {activeTab === "stats" && <StudentStats />}
        </div>
      </div>
    </div>
  );
};

export default PTSModule;
