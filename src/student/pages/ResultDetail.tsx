import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResultsService from '../../services/results.service';
import '../styles/Dashboard.css';
import '../styles/ResultDetail.css';

const ResultDetail: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) {
        setError('Attempt ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ResultsService.getResultDetail(attemptId);
        if (response.success) {
          setResult(response.data);
        } else {
          setError('Failed to fetch result: ' + (response.message || 'Unknown error'));
        }
      } catch (err: any) {
        console.error('Error fetching result detail:', err);
        setError(err.message || 'Failed to fetch result detail');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  // Calculate Sectional Summary Stats
  const sectionStats = useMemo(() => {
    if (!result) return [];

    // Structure to hold section stats
    interface SectionStat {
      name: string;
      total: number;
      attempted: number;
      correct: number;
      wrong: number;
      score: number;
      maxScore: number;
    }

    const stats: Record<string, SectionStat> = {};

    // 1. Initialize sections from entity_marks or create from answers
    if (result.entity_marks) {
      Object.keys(result.entity_marks).forEach(sec => {
        stats[sec] = {
          name: sec,
          total: 0,
          attempted: 0,
          correct: 0,
          wrong: 0,
          score: 0, // Start with 0, will accumulate from answers
          maxScore: 0
        };
      });
    }

    // 2. Process all answers to calculate actual stats
    if (result.answers && Array.isArray(result.answers)) {
      result.answers.forEach((ans: any) => {
        // Determine section name - try multiple approaches
        let secName = ans.section || ans.subject || ans.category || ans.type;
        
        // Try to infer section from question type or other fields
        if (!secName) {
          // Check if it's a coding question based on question text or answer format
          const questionText = (ans.questionText || '').toLowerCase();
          const selectedAnswer = (ans.selected && ans.selected.length > 0) ? ans.selected[0] : '';
          
          if (questionText.includes('code') || questionText.includes('program') || 
              selectedAnswer.includes('#include') || selectedAnswer.includes('int main') ||
              selectedAnswer.includes('def ') || selectedAnswer.includes('public class')) {
            secName = 'CODING';
          } else if (questionText.includes('mcq') || questionText.includes('choice') || 
                     Array.isArray(ans.correctAnswer)) {
            secName = 'MCQ';
          }
        }

        // If no explicit section in answer, try to map based on knowledge
        if (!secName) {
          // If we have only 1 section in entity_marks, then assign all to it.
          const keys = Object.keys(stats);
          if (keys.length === 1) secName = keys[0];
          else if (keys.length === 2) {
            // If we have exactly 2 sections (likely MCQ and CODING), try to assign based on answer content
            const selectedAnswer = (ans.selected && ans.selected.length > 0) ? ans.selected[0] : '';
            if (selectedAnswer.includes('#include') || selectedAnswer.includes('int main') ||
                selectedAnswer.includes('def ') || selectedAnswer.includes('public class')) {
              secName = keys.find(key => key.toUpperCase().includes('CODING')) || keys[1];
            } else {
              secName = keys.find(key => key.toUpperCase().includes('MCQ')) || keys[0];
            }
          }
          else return; // Skip answers without valid section
        }

        // Create section if it doesn't exist
        if (!stats[secName]) {
          stats[secName] = {
            name: secName,
            total: 0,
            attempted: 0,
            correct: 0,
            wrong: 0,
            score: 0,
            maxScore: 0
          };
        }

        // Count total questions in this section
        stats[secName].total++;
        stats[secName].maxScore += (ans.marks || 1); // Add max possible marks

        // Check if student attempted this question
        const hasSelection = ans.selected && ans.selected.length > 0;
        if (hasSelection) {
          stats[secName].attempted++;
          
          // Check if answer is correct
          if (ans.isCorrect) {
            stats[secName].correct++;
            // Add actual marks earned for this correct answer
            stats[secName].score += (ans.marks || 1);
          } else {
            stats[secName].wrong++;
          }
        }
      });
    }

    // 3. Fallback: If no answers were processed but we have entity_marks, use them
    // Also distribute overall score if sections have 0 processed answers
    if (result.entity_marks) {
      Object.keys(result.entity_marks).forEach(sec => {
        if (!stats[sec]) {
          stats[sec] = {
            name: sec,
            total: 0,
            attempted: 0,
            correct: 0,
            wrong: 0,
            score: result.entity_marks[sec] || 0,
            maxScore: result.entity_marks[sec] || 0
          };
        } else if (stats[sec].total === 0) {
          // If section exists but no answers were processed, use entity_marks
          stats[sec].score = result.entity_marks[sec] || 0;
          stats[sec].maxScore = result.entity_marks[sec] || 0;
          // Set attempted to 1 if score > 0 to avoid division by zero
          if (stats[sec].score > 0) {
            stats[sec].attempted = 1;
            stats[sec].correct = 1;
            stats[sec].total = 1;
          }
        }
      });
    }

    return Object.values(stats);
  }, [result]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Result...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/student/results')} className="back-btn" style={{ display: 'inline-flex' }}>Back</button>
      </div>
    );
  }

  if (!result) return <div>Result not found</div>;

  return (
    <div className="result-detail-container">
      {/* Header */}
      <div className="result-header">
        <h1>Result Details</h1>
      </div>

      {/* Score & Percentage */}
      <div className="result-card">
        <h2 className="card-title">Score & Percentage</h2>
        <div className="score-grid">
          <div className="score-item">
            <span className="score-label">Score</span>
            <span className="score-val">{result.score || 0} / {result.maxScore || 0}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Percentage</span>
            <span className="score-val">{typeof result.percentage === 'number' ? result.percentage.toFixed(2) : result.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="result-card">
        <h2 className="card-title">Statistics</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-box-label">Correct</div>
            <div className="stat-box-value" style={{ color: '#059669' }}>{result.numCorrect || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Incorrect</div>
            <div className="stat-box-value" style={{ color: '#dc2626' }}>{result.numIncorrect || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Unattempted</div>
            <div className="stat-box-value" style={{ color: '#6b7280' }}>{result.numUnattempted || 0}</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Accuracy</div>
            <div className="stat-box-value" style={{ color: '#9768E1' }}>{result.accuracy ? result.accuracy.toFixed(2) : 0}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-box-label">Time Spent</div>
            <div className="stat-box-value">{formatTime(result.timeSpentSeconds || 0)}</div>
          </div>
        </div>
      </div>

      {/* Sectional Summary Table */}
      {sectionStats.length > 0 && (
        <div className="result-card">
          <h2 className="card-title">Sectional Summary</h2>
          <div className="section-table-container">
            <table className="section-table">
              <thead>
                <tr>
                  <th>SECTION</th>
                  <th>ATTEMPTED</th>
                  <th>CORRECT / WRONG</th>
                  <th>MARKS</th>
                  <th>PERCENTAGE</th>
                  <th>ACCURACY</th>
                </tr>
              </thead>
              <tbody>
                {sectionStats.map((sec) => {
                  const percentage = sec.maxScore > 0 ? (sec.score / sec.maxScore) * 100 : 0;
                  const accuracy = sec.attempted > 0 ? (sec.correct / sec.attempted) * 100 : 0;

                  return (
                    <tr key={sec.name}>
                      <td className="section-name">{sec.name}</td>
                      <td>{sec.attempted} / {sec.total}</td>
                      <td>{sec.correct} / {sec.wrong}</td>
                      <td>{sec.score.toFixed(2)} / {sec.maxScore}</td>
                      <td>{percentage.toFixed(2)}%</td>
                      <td>{accuracy.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Answers */}
      {result.answers && result.answers.length > 0 && (
        <div className="result-card">
          <h2 className="card-title">Answers</h2>
          <div className="answers-list">
            {result.answers.map((answer: any, index: number) => {
              const hasSelection = answer.selected && answer.selected.length > 0;
              const status = answer.isCorrect && hasSelection ? 'Correct' : (!answer.isCorrect && hasSelection ? 'Incorrect' : 'Unattempted');

              return (
                <div key={index} className="answer-item">
                  <div className="answer-header">
                    <span>Question {index + 1}</span>
                    <span className={`answer-status ${status.toLowerCase()}`}>{status}</span>
                  </div>
                  <div style={{ marginBottom: '8px', color: '#374151' }}>{answer.questionText || 'Question text not available'}</div>
                  <div className="answer-detail-row">
                    <span className="answer-val"><strong>Your Answer:</strong> {hasSelection ? answer.selected.join(', ') : 'None'}</span>
                    <span className="answer-val"><strong>Correct Answer:</strong> {answer.correctAnswer ? (Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer) : 'Hidden'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResultDetail;

