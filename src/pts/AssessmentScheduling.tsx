import React, { useState, useEffect } from "react";

interface Assessment {
  id: number;
  title: string;
  department: string;
  duration: number;
  totalMarks: number;
  questions: number;
  status: 'draft' | 'active' | 'scheduled' | 'completed';
}

interface ScheduledAssessment {
  id: number;
  assessmentId: number;
  assessmentTitle: string;
  department: string;
  date: string;
  time: string;
  duration: number;
  batchIds: number[];
  batchNames: string[];
  status: 'scheduled' | 'active' | 'completed';
}

interface Batch {
  id: number;
  name: string;
  department: string;
  students: number;
}

const AssessmentScheduling: React.FC = () => {
  const [availableAssessments, setAvailableAssessments] = useState<Assessment[]>([]);
  const [scheduledAssessments, setScheduledAssessments] = useState<ScheduledAssessment[]>([]);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  
  const [selectedAssessment, setSelectedAssessment] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "All Departments"];

  // Mock data initialization
  useEffect(() => {
    // Mock assessments
    setAvailableAssessments([
      { id: 1, title: "React Fundamentals", department: "Computer Science", duration: 60, totalMarks: 100, questions: 20, status: 'draft' },
      { id: 2, title: "JavaScript Basics", department: "Computer Science", duration: 90, totalMarks: 150, questions: 30, status: 'draft' },
      { id: 3, title: "Data Structures", department: "Computer Science", duration: 120, totalMarks: 200, questions: 40, status: 'draft' },
      { id: 4, title: "Database Management", department: "Information Technology", duration: 75, totalMarks: 100, questions: 25, status: 'draft' },
      { id: 5, title: "Network Security", department: "Information Technology", duration: 90, totalMarks: 120, questions: 24, status: 'draft' }
    ]);

    // Mock batches
    setAvailableBatches([
      { id: 1, name: "CSE-2021-A", department: "Computer Science", students: 60 },
      { id: 2, name: "CSE-2021-B", department: "Computer Science", students: 58 },
      { id: 3, name: "CSE-2022-A", department: "Computer Science", students: 62 },
      { id: 4, name: "IT-2021-A", department: "Information Technology", students: 55 },
      { id: 5, name: "IT-2021-B", department: "Information Technology", students: 57 },
      { id: 6, name: "ECE-2021-A", department: "Electronics", students: 50 }
    ]);

    // Mock scheduled assessments
    setScheduledAssessments([
      {
        id: 1,
        assessmentId: 1,
        assessmentTitle: "React Fundamentals",
        department: "Computer Science",
        date: "2025-11-05",
        time: "10:00",
        duration: 60,
        batchIds: [1, 2],
        batchNames: ["CSE-2021-A", "CSE-2021-B"],
        status: 'scheduled'
      },
      {
        id: 2,
        assessmentId: 4,
        assessmentTitle: "Database Management",
        department: "Information Technology", 
        date: "2025-11-03",
        time: "14:00",
        duration: 75,
        batchIds: [4],
        batchNames: ["IT-2021-A"],
        status: 'active'
      }
    ]);
  }, []);

  const filteredAssessments = selectedDepartment && selectedDepartment !== "All Departments"
    ? availableAssessments.filter(assessment => assessment.department === selectedDepartment)
    : availableAssessments;

  const filteredBatches = selectedDepartment && selectedDepartment !== "All Departments"
    ? availableBatches.filter(batch => batch.department === selectedDepartment)
    : availableBatches;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssessment || !selectedDate || !selectedTime || selectedBatches.length === 0) {
      alert("Please fill all required fields and select at least one batch");
      return;
    }

    setIsSubmitting(true);

    const selectedAssessmentData = availableAssessments.find(a => a.id === selectedAssessment);
    const selectedBatchData = availableBatches.filter(b => selectedBatches.includes(b.id));

    const newScheduledAssessment: ScheduledAssessment = {
      id: Date.now(),
      assessmentId: selectedAssessment,
      assessmentTitle: selectedAssessmentData?.title || "",
      department: selectedAssessmentData?.department || "",
      date: selectedDate,
      time: selectedTime,
      duration: selectedAssessmentData?.duration || 60,
      batchIds: selectedBatches,
      batchNames: selectedBatchData.map(b => b.name),
      status: 'scheduled'
    };

    setTimeout(() => {
      setScheduledAssessments(prev => [...prev, newScheduledAssessment]);
      setSuccessMessage("Assessment scheduled successfully!");
      
      // Reset form
      setSelectedAssessment(0);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedBatches([]);
      setShowScheduleForm(false);
      setIsSubmitting(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  const handleBatchSelection = (batchId: number) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const cancelScheduledAssessment = (scheduleId: number) => {
    if (confirm("Are you sure you want to cancel this scheduled assessment?")) {
      setScheduledAssessments(prev => prev.filter(s => s.id !== scheduleId));
    }
  };



  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="pts-fade-in">
      {successMessage && (
        <div className="pts-success">
          {successMessage}
        </div>
      )}

      {/* Schedule New Assessment Section */}
      <div className="pts-form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="pts-form-title">Schedule Assessment</h2>
          <button
            type="button"
            className="pts-btn-primary"
            onClick={() => setShowScheduleForm(!showScheduleForm)}
          >
            {showScheduleForm ? "Cancel" : "Schedule New"}
          </button>
        </div>

        {showScheduleForm && (
          <form onSubmit={handleScheduleSubmit}>
            <div className="pts-form-grid">
              <div className="pts-form-group">
                <label className="pts-form-label">Department Filter</label>
                <select
                  className="pts-form-select"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedAssessment(0);
                    setSelectedBatches([]);
                  }}
                >
                  <option value="">All Departments</option>
                  {departments.filter(dept => dept !== "All Departments").map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Select Assessment *</label>
                <select
                  className="pts-form-select"
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(parseInt(e.target.value))}
                  required
                >
                  <option value={0}>Choose an assessment</option>
                  {filteredAssessments.map(assessment => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.title} ({assessment.duration}min, {assessment.totalMarks} marks)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Date *</label>
                <input
                  type="date"
                  className="pts-form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  required
                />
              </div>

              <div className="pts-form-group">
                <label className="pts-form-label">Start Time *</label>
                <input
                  type="time"
                  className="pts-form-input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Batch Selection */}
            {filteredBatches.length > 0 && (
              <div className="pts-form-group">
                <label className="pts-form-label">Select Batches * ({selectedBatches.length} selected)</label>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
                  gap: "10px",
                  marginTop: "10px"
                }}>
                  {filteredBatches.map(batch => (
                    <div
                      key={batch.id}
                      style={{
                        padding: "12px",
                        border: `2px solid ${selectedBatches.includes(batch.id) ? "#9768E1" : "#e9ecef"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: selectedBatches.includes(batch.id) ? "#f8f9fa" : "white",
                        transition: "all 0.2s ease"
                      }}
                      onClick={() => handleBatchSelection(batch.id)}
                    >
                      <div style={{ fontWeight: "600", color: "#523C48" }}>{batch.name}</div>
                      <div style={{ fontSize: "0.9rem", color: "#A4878D" }}>
                        {batch.department} • {batch.students} students
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pts-form-buttons">
              <button
                type="button"
                className="pts-btn-secondary"
                onClick={() => setShowScheduleForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pts-btn-primary"
                disabled={isSubmitting}
                style={{
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer"
                }}
              >
                {isSubmitting ? "Scheduling..." : "Schedule Assessment"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Scheduled Assessments List */}
      <div className="pts-form-container">
        <h3 className="pts-form-title">Scheduled Assessments ({scheduledAssessments.length})</h3>
        
        {scheduledAssessments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A4878D" }}>
            <p>No assessments scheduled yet.</p>
            <p>Use the "Schedule New" button above to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {scheduledAssessments.map(scheduled => (
              <div
                key={scheduled.id}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #e9ecef"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <h4 style={{ color: "#523C48", margin: 0 }}>{scheduled.assessmentTitle}</h4>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: scheduled.status === 'scheduled' ? '#ffc107' : 
                                    scheduled.status === 'active' ? '#28a745' : 
                                    scheduled.status === 'completed' ? '#6c757d' : '#17a2b8',
                          color: scheduled.status === 'scheduled' ? '#000' : '#fff'
                        }}
                      >
                        {scheduled.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                      <div>
                        <strong>Department:</strong> {scheduled.department}
                      </div>
                      <div>
                        <strong>Date & Time:</strong> {new Date(scheduled.date).toLocaleDateString()} at {scheduled.time}
                      </div>
                      <div>
                        <strong>Duration:</strong> {scheduled.duration} minutes
                      </div>
                      <div>
                        <strong>Batches:</strong> {scheduled.batchNames.join(", ")}
                      </div>
                    </div>
                  </div>
                  
                  {scheduled.status === 'scheduled' && (
                    <button
                      onClick={() => cancelScheduledAssessment(scheduled.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        marginLeft: "15px"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentScheduling;