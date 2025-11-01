import React, { useState } from "react";

const AssessmentCreation: React.FC = () => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [marks, setMarks] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, duration, marks, instructions });
    alert("Assessment Created Successfully!");
    setTitle("");
    setDuration("");
    setMarks("");
    setInstructions("");
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
    },
    textarea: {
      padding: "0.8rem 1rem",
      borderRadius: "10px",
      border: "1px solid #D0BFE7",
      outline: "none",
      backgroundColor: "#E4D5F8",
      color: "#523C48",
      minHeight: "100px",
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
      <h2 style={styles.header}>Create New Assessment</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div>
          <label style={styles.label}>Assessment Title</label>
          <input
            type="text"
            placeholder="Enter assessment title"
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Duration (in minutes)</label>
            <input
              type="number"
              placeholder="60"
              style={styles.input}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Total Marks</label>
            <input
              type="number"
              placeholder="100"
              style={styles.input}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label style={styles.label}>Instructions</label>
          <textarea
            placeholder="Enter any important instructions"
            style={styles.textarea}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
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
          Create Assessment
        </button>
      </form>
    </div>
  );
};

export default AssessmentCreation;
