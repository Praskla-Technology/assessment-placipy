import React, { useState } from "react";

const AssessmentScheduling: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [visibility, setVisibility] = useState("Department");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      enabled,
      date,
      time,
      duration,
      visibility,
    });
    alert("Assessment scheduled successfully!");
  };

  const styles = {
    container: {
      backgroundColor: "#FBFAFB",
      padding: "2rem",
      borderRadius: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      width: "90%",
      maxWidth: "900px",
      margin: "2rem auto",
      color: "#523C48",
    },
    header: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: "#523C48",
      marginBottom: "1.5rem",
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
    },
    label: {
      fontWeight: 500,
    },
    input: {
      padding: "0.8rem 1rem",
      borderRadius: "10px",
      border: "1px solid #D0BFE7",
      outline: "none",
      backgroundColor: "#E4D5F8",
      color: "#523C48",
      width: "100%",
    },
    select: {
      padding: "0.8rem 1rem",
      borderRadius: "10px",
      border: "1px solid #D0BFE7",
      outline: "none",
      backgroundColor: "#E4D5F8",
      color: "#523C48",
      width: "100%",
    },
    toggleContainer: {
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      marginBottom: "1rem",
    },
    toggleLabel: {
      fontWeight: 500,
    },
    checkbox: {
      width: "22px",
      height: "22px",
      accentColor: "#9768E1",
      cursor: "pointer",
    },
    button: {
      marginTop: "1.5rem",
      padding: "0.9rem 1.2rem",
      backgroundColor: "#9768E1",
      color: "#FBFAFB",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "1rem",
      transition: "0.3s",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Schedule Assessment</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.toggleContainer}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={styles.checkbox}
          />
          <label style={styles.toggleLabel}>
            {enabled ? "Enabled" : "Disabled"}
          </label>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Date</label>
            <input
              type="date"
              style={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Start Time</label>
            <input
              type="time"
              style={styles.input}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={styles.label}>Duration (minutes)</label>
          <input
            type="number"
            placeholder="60"
            style={styles.input}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={styles.label}>Visibility</label>
          <select
            style={styles.select}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          >
            <option value="Department">Department Only</option>
            <option value="AllCollege">All College</option>
          </select>
        </div>

        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#A4878D")
          }
          onMouseOut={(e) =>
            ((e.target as HTMLButtonElement).style.backgroundColor = "#9768E1")
          }
        >
          Schedule Assessment
        </button>
      </form>
    </div>
  );
};

export default AssessmentScheduling;
