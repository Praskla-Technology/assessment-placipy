# Assessment Navigation Implementation Guide

## Overview

This guide explains the enhanced navigation flow in the assessment system that automatically moves students from MCQ questions to coding questions (if present) or submits the assessment when there are no coding questions.

## Navigation Flow

### MCQ Questions Navigation

1. **Within MCQ Questions**:
   - Student clicks "Save and Next" to move between MCQ questions
   - Answers are automatically saved when navigating
   - "Previous" button allows returning to earlier questions

2. **End of MCQ Questions**:
   - When student reaches the last MCQ question and clicks "Save and Next":
     - System checks if coding questions exist
     - If coding questions exist: Automatically switch to coding tab
     - If no coding questions: Automatically submit the assessment

### Coding Questions Navigation

1. **Within Coding Questions**:
   - Student works on coding challenges
   - Code is automatically saved
   - Navigation between coding questions using provided controls

2. **End of Assessment**:
   - After completing all coding questions, student can submit

## Implementation Details

### 1. Navigation Logic ([AssessmentTaking.tsx](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.tsx))

```typescript
// Handle MCQ navigation (Save and Next button)
const handleMCQNavigation = (direction: 'next' | 'prev') => {
  if (direction === 'next') {
    // Save current answer before moving to next question
    if (currentMCQIndex < mcqQuestions.length - 1) {
      // Move to next MCQ question
      setCurrentMCQIndex(prev => prev + 1);
    } else {
      // Reached the end of MCQ questions
      // Check if there are coding questions
      if (codingChallenges.length > 0) {
        // Switch to coding tab
        setActiveTab('coding');
        setCurrentCodingIndex(0);
      } else {
        // No coding questions, submit the assessment
        handleSubmit();
      }
    }
  } else if (direction === 'prev') {
    // Move to previous question
    if (currentMCQIndex > 0) {
      setCurrentMCQIndex(prev => prev - 1);
    }
  }
};
```

### 2. Button Text and State

```typescript
// Dynamic button text
{currentMCQIndex === mcqQuestions.length - 1 ? 'Submit' : 'Save and Next'}

// Dynamic button disabled state
disabled={currentMCQIndex === mcqQuestions.length - 1 && codingChallenges.length === 0}
```

### 3. Conditional Submit Button

```typescript
// Submit button only shown when no coding questions exist
{codingChallenges.length === 0 && (
  <button 
    className="submit-btn small right-corner"
    onClick={handleSubmit}
  >
    Submit
  </button>
)}
```

## User Experience Flow

### Scenario 1: Assessment with Both MCQ and Coding Questions

1. Student starts with MCQ questions
2. Navigates through MCQ questions using "Save and Next"
3. On the last MCQ question, the button text changes to "Submit"
4. Clicking "Submit" automatically switches to the coding tab
5. Student completes coding challenges
6. Student manually submits the assessment

### Scenario 2: Assessment with Only MCQ Questions

1. Student starts with MCQ questions
2. Navigates through MCQ questions using "Save and Next"
3. On the last MCQ question, the button text changes to "Submit"
4. Clicking "Submit" automatically submits the assessment
5. Submit button is visible in the corner for manual submission

### Scenario 3: Assessment with Only Coding Questions

1. Student starts directly on coding tab
2. Student completes coding challenges
3. Student manually submits the assessment

## Key Features

1. **Automatic Navigation**: Seamless transition from MCQ to coding questions
2. **Intelligent Button Text**: "Save and Next" changes to "Submit" at the end
3. **Conditional UI**: Submit button visibility based on question types
4. **Answer Preservation**: Answers automatically saved during navigation
5. **Flexible Flow**: Works with all combinations of question types

## Testing

### Test Cases

1. **MCQ + Coding Assessment**:
   - Verify navigation from last MCQ to coding tab
   - Confirm automatic tab switching
   - Ensure assessment submission after coding

2. **MCQ Only Assessment**:
   - Verify "Submit" button appears at end of MCQ questions
   - Confirm direct submission without coding tab
   - Ensure submit button visibility

3. **Coding Only Assessment**:
   - Verify direct access to coding tab
   - Confirm normal coding workflow
   - Ensure manual submission capability

## Benefits

1. **Improved User Experience**: No manual tab switching required
2. **Reduced Confusion**: Clear navigation path based on question types
3. **Automatic Workflow**: System handles transitions intelligently
4. **Consistent Interface**: Appropriate controls shown based on context
5. **Error Prevention**: Prevents students from missing question sections

This implementation ensures that when students complete MCQ questions, they are automatically directed to coding questions if they exist, or the assessment is submitted if there are no coding questions.