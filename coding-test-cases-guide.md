# Coding Question Test Cases Implementation Guide

## Overview

This guide explains how test cases for coding questions are implemented in the assessment system, covering both backend storage and frontend usage.

## Test Case Structure

### Backend Storage Format

Test cases are stored in the database as part of coding questions with the following structure:

```json
{
  "testCases": [
    {
      "inputs": {
        "input": "ui"
      },
      "expectedOutput": "ik"
    }
  ]
}
```

### Frontend Consumption Format

The frontend expects test cases in a simplified format:

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

## Implementation Details

### 1. Backend Processing

In [StudentAssessmentService.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/src/services/StudentAssessmentService.ts), test cases are processed during question retrieval:

```typescript
// For coding questions, ensure testCases are properly formatted
if (question.entityType === 'coding' && question.testCases) {
    // Transform test cases to the expected format for frontend
    const formattedTestCases = question.testCases.map((tc: any) => ({
        input: tc.inputs?.input || tc.input || '',
        expectedOutput: tc.expectedOutput || ''
    }));
    
    return {
        ...question,
        testCases: formattedTestCases
    };
}
```

### 2. Frontend Processing

In [student.assessment.service.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/services/student.assessment.service.ts), additional processing ensures consistency:

```typescript
// Ensure test cases have the correct structure for the frontend
const formattedTestCases = question.testCases.map((tc: any) => ({
    input: tc.input || (tc.inputs ? tc.inputs.input : '') || '',
    expectedOutput: tc.expectedOutput || ''
}));
```

### 3. Component Usage

In [AssessmentTaking.tsx](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/src/student/components/AssessmentTaking.tsx), test cases are logged for debugging:

```typescript
// Log coding questions with test cases for debugging
const codingQuestions = transformedData.codingQuestions || [];
if (codingQuestions.length > 0) {
    console.log('Found coding questions with test cases:');
    codingQuestions.forEach((question: any, index: number) => {
        console.log(`Question ${index + 1} (${question.questionId}):`, question);
        if (question.testCases && question.testCases.length > 0) {
            console.log(`  Test cases for ${question.questionId}:`, question.testCases);
        } else {
            console.log(`  No test cases found for ${question.questionId}`);
        }
    });
}
```

## Testing

### Test Script

A test script [test-coding-question-fetch.js](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/scripts/test-coding-question-fetch.js) is provided to verify test case retrieval:

```bash
cd c:\Users\NagaNandhini\OneDrive\Desktop\pleci\assessment-placipy\backend
node scripts/test-coding-question-fetch.js ASSESS_CSE_001 Q_001
```

### Expected Output

When running the test script, you should see output similar to:

```
=== TEST 3: Finding Specific Coding Question ===
Total questions found: 1
✅ Target question found!
✅ Question has test cases!
Test cases: [
  {
    "inputs": {
      "input": "ui"
    },
    "expectedOutput": "ik"
  }
]
Formatted test cases for frontend: [
  {
    "input": "ui",
    "expectedOutput": "ik"
  }
]
```

## Usage in Code Evaluation

Test cases are consumed by the Judge0 service in [codeEvaluation.controller.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/src/controllers/codeEvaluation.controller.ts):

```typescript
// Execute code with test cases using Judge0
const evaluationResult = await Judge0Service.executeCodeWithTestCases(code, language, testCases);
```

The [Judge0Service.ts](file:///c%3A/Users/NagaNandhini/OneDrive/Desktop/pleci/assessment-placipy/backend/src/services/Judge0Service.ts) processes test cases as:

```typescript
for (const testCase of testCases) {
    const submission: Judge0Submission = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.expectedOutput.trim()
    };
    // ... execution logic
}
```

## Key Points

1. **Format Transformation**: Test cases are automatically transformed from backend format to frontend format
2. **Backward Compatibility**: The system handles both formats to ensure compatibility
3. **Error Handling**: Graceful handling of missing or malformed test cases
4. **Debugging Support**: Comprehensive logging for troubleshooting
5. **Performance**: Efficient processing without unnecessary overhead

## Troubleshooting

If test cases aren't appearing in the frontend:

1. **Check Database Structure**: Verify test cases exist in the `testCases` field
2. **Verify Processing**: Check browser console for processing logs
3. **Test Direct Access**: Use the test script to verify database retrieval
4. **Check Network**: Ensure API responses include test cases
5. **Validate Format**: Confirm test cases follow the expected structure