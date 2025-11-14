import React, { useState } from "react";
import AssessmentService from "../services/assessment.service";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface AssessmentData {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  department: string;
  difficulty: string;
  category: string;
  questions: Question[];
}

const AssessmentCreation: React.FC = () => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 100,
    instructions: "",
    department: "",
    difficulty: "medium",
    category: "",
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: 0,
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "All Departments"];
  const categories = ["Programming", "Theory", "Aptitude", "Technical", "General Knowledge"];

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field: keyof Question, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      alert("Please enter a question text");
      return;
    }

    if (currentQuestion.options.some(option => !option.trim())) {
      alert("Please fill all options");
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      id: Date.now()
    };

    setAssessmentData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset form
    setCurrentQuestion({
      id: 0,
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1
    });

    setShowQuestionForm(false);
  };

  const removeQuestion = (questionId: number) => {
    setAssessmentData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== CREATE ASSESSMENT CLICKED ===');
    console.log('Questions count:', assessmentData.questions.length);
    console.log('Assessment data:', assessmentData);
    
    if (assessmentData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setIsSubmitting(true);
    console.log('Calling backend API...');
    
    try {
      const response = await AssessmentService.createAssessment(assessmentData);
      console.log("✅ Assessment Created:", response);
      setSuccessMessage("Assessment created successfully!");
      
      // Reset form
      setAssessmentData({
        title: "",
        description: "",
        duration: 60,
        totalMarks: 100,
        instructions: "",
        department: "",
        difficulty: "medium",
        category: "",
        questions: []
      });
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error: any) {
      console.error("❌ Failed to create assessment:", error);
      alert(`Failed to create assessment: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      console.log('=== SUBMISSION COMPLETE ===');
    }
  };

  const calculateTotalMarks = () => {
    return assessmentData.questions.reduce((sum, question) => sum + question.marks, 0);
  };

  return (
    <div className="pts-fade-in">
      {successMessage && (
        <div className="pts-success">
          {successMessage}
        </div>
      )}

      <div className="pts-form-container">
        <h2 className="pts-form-title">Create New Assessment</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="pts-form-grid">
            <div className="pts-form-group">
              <label className="pts-form-label">Assessment Title *</label>
              <input
                type="text"
                className="pts-form-input"
                placeholder="Enter assessment title"
                value={assessmentData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">Department *</label>
              <select
                className="pts-form-select"
                value={assessmentData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">Duration (minutes) *</label>
              <input
                type="number"
                className="pts-form-input"
                placeholder="60"
                value={assessmentData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                min="1"
                required
              />
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">Category</label>
              <select
                className="pts-form-select"
                value={assessmentData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="pts-form-group">
              <label className="pts-form-label">Difficulty Level</label>
              <select
                className="pts-form-select"
                value={assessmentData.difficulty}
                onChange={(e) => handleInputChange("difficulty", e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Description</label>
            <textarea
              className="pts-form-textarea"
              placeholder="Brief description of the assessment"
              value={assessmentData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="pts-form-group">
            <label className="pts-form-label">Instructions</label>
            <textarea
              className="pts-form-textarea"
              placeholder="Instructions for students (e.g., calculator allowed, time limits, etc.)"
              value={assessmentData.instructions}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              rows={4}
            />
          </div>

          {/* Questions Section */}
          <div style={{ marginTop: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#523C48", margin: 0 }}>
                Questions ({assessmentData.questions.length}) - Total Marks: {calculateTotalMarks()}
              </h3>
              <button
                type="button"
                className="pts-btn-primary"
                onClick={() => setShowQuestionForm(true)}
              >
                Add Question
              </button>
            </div>

            {/* Question Form */}
            {showQuestionForm && (
              <div className="pts-form-container" style={{ marginBottom: "20px", padding: "20px" }}>
                <h4 style={{ color: "#523C48", marginBottom: "15px" }}>Add New Question</h4>
                
                <div className="pts-form-group">
                  <label className="pts-form-label">Question Text *</label>
                  <textarea
                    className="pts-form-textarea"
                    placeholder="Enter your question here"
                    value={currentQuestion.text}
                    onChange={(e) => handleQuestionChange("text", e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="pts-form-grid">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="pts-form-group">
                      <label className="pts-form-label">Option {index + 1} *</label>
                      <input
                        type="text"
                        className="pts-form-input"
                        placeholder={`Enter option ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="pts-form-grid">
                  <div className="pts-form-group">
                    <label className="pts-form-label">Correct Answer</label>
                    <select
                      className="pts-form-select"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => handleQuestionChange("correctAnswer", parseInt(e.target.value))}
                    >
                      {currentQuestion.options.map((_, index) => (
                        <option key={index} value={index}>Option {index + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pts-form-group">
                    <label className="pts-form-label">Marks</label>
                    <input
                      type="number"
                      className="pts-form-input"
                      placeholder="1"
                      value={currentQuestion.marks}
                      onChange={(e) => handleQuestionChange("marks", parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                </div>

                <div className="pts-form-buttons">
                  <button
                    type="button"
                    className="pts-btn-secondary"
                    onClick={() => setShowQuestionForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="pts-btn-primary"
                    onClick={addQuestion}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {assessmentData.questions.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                {assessmentData.questions.map((question, index) => (
                  <div key={question.id} style={{ 
                    background: "white", 
                    padding: "20px", 
                    borderRadius: "8px", 
                    marginBottom: "15px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: "#523C48", margin: "0 0 10px 0" }}>
                          Question {index + 1} ({question.marks} marks)
                        </h4>
                        <p style={{ color: "#523C48", margin: "0 0 10px 0" }}>{question.text}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                backgroundColor: optIndex === question.correctAnswer ? "#d4edda" : "#f8f9fa",
                                color: "#523C48",
                                fontSize: "0.9rem"
                              }}
                            >
                              {optIndex + 1}. {option}
                              {optIndex === question.correctAnswer && " ✓"}
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginLeft: "15px"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pts-form-buttons" style={{ marginTop: "30px" }}>
            <button
              type="submit"
              className="pts-btn-primary"
              disabled={isSubmitting || assessmentData.questions.length === 0}
              style={{
                opacity: isSubmitting || assessmentData.questions.length === 0 ? 0.6 : 1,
                cursor: isSubmitting || assessmentData.questions.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Creating Assessment..." : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentCreation;