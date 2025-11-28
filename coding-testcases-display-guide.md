# Coding Test Cases Display Implementation Guide

## Overview

This guide explains how test cases are displayed in the coding module frontend, showing students the input and expected output for each test case below the question description.

## Implementation Details

### 1. Data Structure

Test cases are stored in the database with the following structure:

```json
{
  "testCases": [
    {
      "input": "ui",
      "expectedOutput": "ik"
    }
  ]
}
```

### 2. Frontend Interface

The frontend uses a simplified TestCase interface:

```typescript
interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}
```

### 3. Display Component

The test cases are displayed in the [AssessmentTaking.tsx](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.tsx) component within the coding question section:

```tsx
{/* Test Cases Section */}
{codingChallenges[currentCodingIndex]?.testCases && codingChallenges[currentCodingIndex]?.testCases.length > 0 && (
  <div className="test-cases-section">
    <h3>Test Cases:</h3>
    <div className="test-cases-container">
      {codingChallenges[currentCodingIndex]?.testCases.map((testCase, index) => (
        <div key={index} className="test-case-item">
          <div className="test-case-header">
            <span className="test-case-number">Test Case {index + 1}</span>
          </div>
          <div className="test-case-content">
            <div className="test-case-input">
              <strong>Input:</strong>
              <pre className="test-case-preformatted">{testCase.input}</pre>
            </div>
            <div className="test-case-output">
              <strong>Expected Output:</strong>
              <pre className="test-case-preformatted">{testCase.expectedOutput}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 4. CSS Styling

The component is styled with dedicated CSS classes in [AssessmentTaking.css](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.css):

```css
.test-cases-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.test-case-item {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.test-case-preformatted {
  background-color: #f1f3f5;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  overflow-x: auto;
}
```

## Display Logic

### Conditional Rendering

Test cases are only displayed when:
1. The coding question has a `testCases` property
2. The `testCases` array is not empty

### Formatting

1. Each test case is displayed in its own card-like container
2. Input and expected output are shown side-by-side (stacked on mobile)
3. Content is displayed in preformatted blocks to preserve formatting
4. Monospace font is used for code-like appearance

## Data Flow

1. **Backend**: Test cases are stored in DynamoDB with the `inputs` and `expectedOutput` structure
2. **Service Layer**: [StudentAssessmentService.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/src/services/StudentAssessmentService.ts) transforms the data to the frontend format
3. **Frontend Service**: [student.assessment.service.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/services/student.assessment.service.ts) ensures consistent formatting
4. **Component**: [AssessmentTaking.tsx](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.tsx) displays the test cases below the question

## Testing

### Test Script

A test script [test-coding-testcases-display.js](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/scripts/test-coding-testcases-display.js) is provided to verify the display format:

```bash
cd c:\Users\NagaNandhini\OneDrive\Desktop\pleci\assessment-placipy\backend
node scripts/test-coding-testcases-display.js ASSESS_CSE_001
```

### Expected Output

For a question with test cases:
```
Processing question: Q_001 (coding)
  This is a coding question
  Test cases found: 1
  Test Case 1:
    Input: ui
    Expected Output: ik
    ✅ Format is correct for frontend display
```

## Key Features

1. **Clear Visualization**: Test cases are clearly separated and visually distinct
2. **Responsive Design**: Adapts to different screen sizes
3. **Preserved Formatting**: Preformatted text maintains spacing and special characters
4. **Conditional Display**: Only shown when test cases exist
5. **Consistent Styling**: Matches the overall assessment interface design
6. **Accessibility**: Proper contrast and readable fonts

## Usage Example

For your example test case:
```json
{
  "input": "ui",
  "expectedOutput": "ik"
}
```

The frontend will display:
```
Test Cases:

Test Case 1
Input:
ui

Expected Output:
ik
```

## Troubleshooting

1. **Missing Test Cases**: Verify the `testCases` property exists in the question data
2. **Formatting Issues**: Check that `input` and `expectedOutput` properties are correctly mapped
3. **Display Problems**: Ensure the CSS classes are properly applied
4. **Empty Sections**: Confirm that the test cases array is not empty
5. **Data Transformation**: Verify that the backend service correctly transforms the data

This implementation ensures that students can easily see the test cases for coding questions, helping them understand what input their code should handle and what output is expected.