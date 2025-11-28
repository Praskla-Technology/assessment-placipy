# MCQ Answer Checking Implementation Guide

## Overview

This guide explains how MCQ answer checking is implemented in the assessment system, covering both backend storage and frontend evaluation.

## Answer Storage Format

MCQ correct answers are stored in the database in two possible formats:

### Array Format (Multiple Correct Answers)
```json
{
  "correctAnswer": ["B", "C"]
}
```

### String Format (Single Correct Answer)
```json
{
  "correctAnswer": "B"
}
```

## Implementation Details

### 1. Backend Storage ([AssessmentService.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/src/services/AssessmentService.ts))

The backend properly formats correct answers when creating assessments:

```typescript
// Handle correctAnswer - convert to array format if needed
if (Array.isArray(question.correctAnswer)) {
    baseQuestion.correctAnswer = question.correctAnswer;
} else if (typeof question.correctAnswer === 'string') {
    baseQuestion.correctAnswer = [question.correctAnswer];
} else if (typeof question.correctAnswer === 'number') {
    baseQuestion.correctAnswer = [String.fromCharCode(65 + question.correctAnswer)];
} else {
    baseQuestion.correctAnswer = [];
}
```

### 2. Frontend Processing ([AssessmentTaking.tsx](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.tsx))

The frontend evaluates student answers against correct answers:

```typescript
// Check if answer is correct by comparing selected option with correct answer
if (mcqAnswers[question.questionId] !== undefined) {
    // Get the option ID (A, B, C, D) for the selected index
    const selectedOptionId = String.fromCharCode(65 + mcqAnswers[question.questionId]);
    
    // Check if the selected option matches any of the correct answers
    let isCorrect = false;
    if (Array.isArray(question.correctAnswer)) {
        isCorrect = question.correctAnswer.includes(selectedOptionId);
    } else if (typeof question.correctAnswer === 'string') {
        isCorrect = question.correctAnswer === selectedOptionId;
    }
    
    if (isCorrect) {
        score += question.points || 1;
    }
    
    // Store correctness for UI feedback
    answers[question.questionId].isCorrect = isCorrect;
}
```

### 3. UI Feedback

The frontend provides visual feedback after submission:

```typescript
// In the options rendering:
let optionClass = "option-item";
if (showFeedback) {
    if (isSelected && mcqResults[questionId].isCorrect) {
        optionClass += " correct-answer";
    } else if (isSelected && !mcqResults[questionId].isCorrect) {
        optionClass += " incorrect-answer";
    } else if (isCorrectOption) {
        optionClass += " correct-answer";
    }
}
```

## Answer Checking Logic

### Single Correct Answer
1. Student selects option B
2. System converts selection to "B"
3. System compares "B" with correctAnswer "B"
4. Match = Correct answer

### Multiple Correct Answers
1. Student selects option B
2. System converts selection to "B"
3. System checks if "B" is in correctAnswer array ["B", "C"]
4. Match found = Correct answer

### Incorrect Answer
1. Student selects option A
2. System converts selection to "A"
3. System compares "A" with correctAnswer "B"
4. No match = Incorrect answer

## Testing

### Test Script ([test-mcq-answer-checking.js](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/scripts/test-mcq-answer-checking.js))

```bash
cd c:\Users\NagaNandhini\OneDrive\Desktop\pleci\assessment-placipy\backend
node scripts/test-mcq-answer-checking.js ASSESS_CSE_001
```

### Expected Output

For a question with correctAnswer: ["B"]:
```
Processing question: Q_001 (mcq)
  This is an MCQ question
  ✅ Correct answer is an array: ["B"]
  Simulating answer checking:
    Answer A: ❌ Incorrect
    Answer B: ✅ Correct
    Answer C: ❌ Incorrect
    Answer D: ❌ Incorrect
```

## Key Features

1. **Flexible Answer Formats**: Supports both single and multiple correct answers
2. **Proper Type Handling**: Handles string and array formats correctly
3. **Visual Feedback**: Shows correct/incorrect answers after submission
4. **Score Calculation**: Accurately calculates scores based on correct answers
5. **UI Enhancement**: Highlights correct and incorrect options with colors
6. **Accessibility**: Clear visual indicators for answer correctness

## Usage Examples

### Backend Creation
```typescript
// Creating an MCQ with single correct answer
const question = {
    text: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "B" // 4 is the correct answer
}

// Creating an MCQ with multiple correct answers
const question2 = {
    text: "Which are prime numbers?",
    options: ["2", "3", "4", "5"],
    correctAnswer: ["A", "B", "D"] // 2, 3, and 5 are prime
}
```

### Frontend Evaluation
```typescript
// Checking a student's answer
const studentAnswerIndex = 1; // Student selected option B
const selectedOptionId = String.fromCharCode(65 + studentAnswerIndex); // "B"
const isCorrect = question.correctAnswer.includes(selectedOptionId); // true
```

## Troubleshooting

1. **Incorrect Answer Detection**: Ensure correctAnswer format matches expected structure
2. **UI Feedback Issues**: Check that submitted state and results are properly set
3. **Score Calculation Errors**: Verify that points are correctly assigned
4. **Type Mismatches**: Ensure consistent handling of string vs array formats
5. **Visual Feedback**: Confirm CSS classes are properly applied

This implementation ensures that MCQ questions with correct answers like `["B"]` are properly evaluated when students select options and submit their answers.