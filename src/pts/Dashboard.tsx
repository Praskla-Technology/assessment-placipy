import React from "react";

const Dashboard: React.FC = () => {
  const colors = {
    background: "#FBFAFB",
    primary: "#9768E1",
    lightLavender: "#E4D5F8",
    neutral: "#A4878D",
    deepPlum: "#523C48",
    pastelLavender: "#D0BFE7",
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const bannerStyle: React.CSSProperties = {
    backgroundColor: colors.primary,
    borderRadius: "16px",
    color: "white",
    padding: "25px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  };

  const bannerText: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "8px",
  };

  const sectionTitle: React.CSSProperties = {
    color: colors.deepPlum,
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "10px",
  };

  const cardGrid: React.CSSProperties = {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    flex: "1",
    minWidth: "200px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const courseCard: React.CSSProperties = {
    backgroundColor: colors.lightLavender,
    border: `1px solid ${colors.pastelLavender}`,
    borderRadius: "12px",
    flex: "1",
    minWidth: "250px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: colors.primary,
    color: "white",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      {/* Welcome Banner */}
      <div style={bannerStyle}>
        <div>
          <div style={{ opacity: 0.9, fontSize: "14px" }}>October 31, 2025</div>
          <div style={bannerText}>Welcome back, John!</div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            Always stay updated in your student portal
          </div>
        </div>
        <img
          src="https://cdn-icons-png.flaticon.com/512/201/201818.png"
          alt="graduation"
          style={{ width: "80px", height: "80px" }}
        />
      </div>

      {/* Finance Section */}
      <div>
        <div style={sectionTitle}>Finance</div>
        <div style={cardGrid}>
          <div style={cardStyle}>
            <div style={{ fontSize: "20px", color: colors.deepPlum, fontWeight: 600 }}>
              $10,000
            </div>
            <div style={{ color: colors.neutral }}>Total Payable</div>
          </div>
          <div
            style={{
              ...cardStyle,
              border: `2px solid ${colors.primary}`,
            }}
          >
            <div style={{ fontSize: "20px", color: colors.primary, fontWeight: 600 }}>
              $5,000
            </div>
            <div style={{ color: colors.deepPlum }}>Total Paid</div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: "20px", color: colors.deepPlum, fontWeight: 600 }}>
              $300
            </div>
            <div style={{ color: colors.neutral }}>Others</div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <div
          style={{
            ...sectionTitle,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Enrolled Courses</span>
          <span style={{ color: colors.primary, cursor: "pointer" }}>See all</span>
        </div>
        <div style={cardGrid}>
          <div style={courseCard}>
            <h4 style={{ color: colors.deepPlum, marginBottom: "10px" }}>
              Object Oriented Programming
            </h4>
            <button style={buttonStyle}>View</button>
          </div>
          <div style={courseCard}>
            <h4 style={{ color: colors.deepPlum, marginBottom: "10px" }}>
              Fundamentals of Database Systems
            </h4>
            <button style={buttonStyle}>View</button>
          </div>
        </div>
      </div>

      {/* Daily Notice */}
      <div>
        <div
          style={{
            ...sectionTitle,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Daily Notice</span>
          <span style={{ color: colors.primary, cursor: "pointer" }}>See all</span>
        </div>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={cardStyle}>
            <h4 style={{ color: colors.deepPlum }}>Prelim payment due</h4>
            <p style={{ color: colors.neutral, fontSize: "14px" }}>
              Sorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <span style={{ color: colors.primary, cursor: "pointer" }}>See more</span>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: colors.deepPlum }}>Exam schedule</h4>
            <p style={{ color: colors.neutral, fontSize: "14px" }}>
              Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
            </p>
            <span style={{ color: colors.primary, cursor: "pointer" }}>See more</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
