import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultsService from '../../services/results.service';
import { useUser } from '../../contexts/UserContext';
import AuthService from '../../services/auth.service';

interface Question {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer?: number;
}

const Quiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  
  // This would normally come from an API or props
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      question: 'What is the output of the following code?',
      codeSnippet: 'console.log(2 + "2" + 2);',
      options: ['4', '6', '222', '22'],
      correctAnswer: 2
    },
    {
      id: 2,
      question: 'Which of the following is not a JavaScript data type?',
      options: ['String', 'Boolean', 'Undefined', 'Float'],
      correctAnswer: 3
    },
    {
      id: 3,
      question: 'What does the `===` operator do?',
      options: [
        'Compares values for equality with type conversion',
        'Assigns a value to a variable',
        'Compares values for equality without type conversion',
        'Checks if a variable is defined'
      ],
      correctAnswer: 2
    }
  ]);

  useEffect(() => {
    // In a real app, you would fetch the quiz questions here
    // const fetchQuiz = async () => {
    //   const response = await fetch(`/api/assessments/${id}/questions`);
    //   const data = await response.json();
    //   setQuestions(data.questions);
    // };
    // fetchQuiz();
  }, [id]);

  const handleAnswerSelect = (selectedAnswer: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].selectedAnswer = selectedAnswer;
    setQuestions(updatedQuestions);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      const correctAnswers = questions.filter(
        (question) => question.selectedAnswer === question.correctAnswer
      ).length;
      setScore(Math.round((correctAnswers / questions.length) * 100));
      setShowScore(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Get user info from context or token
      let studentEmail = user?.email || '';
      let studentName = user?.name || '';
      
      // If not in context, try to get from token
      if (!studentEmail) {
        try {
          const token = AuthService.getAccessToken();
          if (token) {
            const userProfile = await AuthService.getUserProfile(token);
            studentEmail = userProfile.email || '';
            studentName = userProfile.name || '';
          }
        } catch (err) {
          console.error('Error getting user from token:', err);
        }
      }
      
      // Final fallback - decode JWT token to get email
      if (!studentEmail) {
        try {
          const token = AuthService.getAccessToken();
          if (token) {
            // Decode JWT token (simple base64 decode)
            const payload = JSON.parse(atob(token.split('.')[1]));
            studentEmail = payload.email || payload['cognito:username'] || payload.username || payload.sub || '';
            studentName = payload.name || payload['cognito:name'] || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || studentEmail;
          }
        } catch (err) {
          console.error('Error decoding token:', err);
        }
      }
      
      if (!studentEmail) {
        alert('User email not found. Please log in again.');
        return;
      }
      
      // If name is still empty, use email
      if (!studentName) {
        studentName = studentEmail;
      }

      if (!id) {
        alert('Assessment ID is missing. Cannot submit.');
        return;
      }

      // Calculate answers in exact format
      const answersArray: any[] = [];
      let score = 0;
      let maxScore = 0;
      let numCorrect = 0;
      let numIncorrect = 0;
      let numUnattempted = 0;

      questions.forEach((question) => {
        maxScore += 1; // Assuming 1 point per question
        const selectedIndex = question.selectedAnswer;
        
        // Get selected option IDs as array of strings
        let selected: string[] = [];
        if (selectedIndex !== undefined) {
          const optionId = String.fromCharCode(65 + selectedIndex); // A, B, C, D
          selected = [optionId];
        }
        
        // Check if correct (assuming correctAnswer is 0-based index)
        const isCorrect = selectedIndex !== undefined && selectedIndex === question.correctAnswer;
        
        if (selectedIndex !== undefined) {
          if (isCorrect) {
            score += 1;
            numCorrect++;
          } else {
            numIncorrect++;
          }
        } else {
          numUnattempted++;
        }
        
        answersArray.push({
          questionId: question.id.toString(),
          selected: selected,
          isCorrect: isCorrect
        });
      });

      const totalQuestions = questions.length;
      const accuracy = totalQuestions > 0 ? Math.round((numCorrect / totalQuestions) * 100) : 0;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      // Prepare result data in EXACT schema
      // Get department from user context
      const department = user?.department || 'Unknown';
      
      const resultData = {
        assessmentId: id,
        email: studentEmail,
        Name: studentName,
        department: department,
        answers: answersArray,
        score: score,
        maxScore: maxScore,
        percentage: percentage,
        accuracy: accuracy,
        numCorrect: numCorrect,
        numIncorrect: numIncorrect,
        numUnattempted: numUnattempted,
        entity_marks: {
          MCQ: score,
          CODING: 0
        },
        timeSpentSeconds: 0, // Quiz doesn't track time
        submittedAt: new Date().toISOString()
      };

      // Save result
      const saveResponse = await ResultsService.saveAssessmentResult(resultData);
      console.log('Save response:', saveResponse);
      
      // Get the SK (attemptId) from the response
      const attemptId = saveResponse?.data?.SK || saveResponse?.SK;
      console.log('Attempt ID (SK):', attemptId);
      
      // Navigate to submission success page with attemptId
      navigate('/student/assessment-submitted', {
        state: {
          assessmentId: id,
          attemptId: attemptId // Pass SK so we can navigate directly to detail page
        }
      });
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz: ' + (error.message || 'Unknown error'));
    }
  };

  if (showScore) {
    return (
      <div className="quiz-container">
        <div className="score-section">
          <h2>Quiz Completed!</h2>
          <p>Your score: {score}%</p>
          <button onClick={handleSubmit} className="submit-btn">
            View Results
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-section">
        <h3>{currentQuestion.question}</h3>
        {currentQuestion.codeSnippet && (
          <pre className="code-snippet">
            <code>{currentQuestion.codeSnippet}</code>
          </pre>
        )}
      </div>

      <div className="options-section">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${
              currentQuestion.selectedAnswer === index ? 'selected' : ''
            }`}
            onClick={() => handleAnswerSelect(index)}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="navigation-buttons">
        <button 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="nav-btn"
        >
          Previous
        </button>
        <button 
          onClick={handleNextQuestion}
          className="nav-btn next-btn"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
