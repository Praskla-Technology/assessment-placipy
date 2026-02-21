# Bulk Question Import Feature Documentation

## Overview
The bulk question import feature allows PTS users to upload multiple assessment questions at once using a CSV file exported from Google Sheets. This feature provides a streamlined workflow for creating assessments with many questions efficiently.

## Features Implemented

### 1. Drag-and-Drop CSV Upload
- **Drag & Drop Zone**: Intuitive drag-and-drop interface for file uploads
- **File Validation**: Accepts only .csv files with proper validation
- **Visual Feedback**: Clear visual indicators during drag operations
- **Manual Selection**: Alternative file browser option for users who prefer clicking

### 2. CSV Parsing & Validation
- **Header Validation**: Ensures required columns are present (case-insensitive):
  - `id` - Unique question identifier
  - `text` - Question text
  - `optionA` - First answer option
  - `optionB` - Second answer option
  - `optionC` - Third answer option
  - `optionD` - Fourth answer option
  - `correctAnswer` - The correct answer (must match one of the options)
  - `marks` - Points awarded for correct answer
- **Robust Parsing**: Handles quoted values, escaped quotes, and various CSV formats
- **Case-Insensitive Headers**: Accepts headers in any case (ID, Id, id, etc.)
- **Data Validation**:
  - Required field checking
  - At least 2 valid options
  - Correct answer validation
  - Positive marks validation
  - Duplicate ID prevention
  - Existing ID checking against current assessment

### 3. Preview & Validation Interface
- **Real-time Preview**: Shows parsed questions in a clean, readable format
- **Validation Status**: Clear indicators for valid/invalid questions
- **Error Display**: Inline error messages for each validation issue
- **Question Removal**: Ability to remove invalid questions from the import
- **Summary Statistics**: Shows count of valid vs invalid questions

### 4. Integration with Assessment Creation
- **Seamless Integration**: Works within the existing assessment creation workflow
- **Question Merging**: Imported questions are added to existing questions
- **Success Feedback**: Clear confirmation of successful import
- **Maintains State**: Preserves existing assessment data

## Technical Implementation

### Component Structure
```
src/pts/
├── components/
│   └── BulkQuestionImport.tsx     # Main import component
├── styles/
│   └── BulkQuestionImport.css     # Component styling
└── AssessmentCreation.tsx         # Updated main component
```

### Key Functions

#### CSV Parsing (`parseCSV`)
- Handles quoted values and escaped quotes
- Supports standard CSV format
- Validates row structure and data integrity

#### Validation Logic
- Field presence validation
- Data type validation (numbers, strings)
- Business rule validation (correct answers, marks)
- Uniqueness validation (IDs)

#### Data Transformation
- Converts CSV data to assessment question format
- Maps fields to expected backend structure
- Handles question numbering and metadata

### Styling
- Responsive design for all screen sizes
- Consistent with existing PTS dashboard styling
- Modern UI with clear visual hierarchy
- Accessible color contrast and interactive states

## Usage Instructions

### For Users

1. **Prepare CSV File**:
   - Create a Google Sheet with the required columns
   - Export as CSV format
   - Ensure all required fields are filled

2. **Upload Process**:
   - Navigate to Assessment Creation
   - Click "Bulk Import Questions" button
   - Drag & drop CSV file or click to browse
   - Review parsed questions and validation results
   - Remove any invalid questions if needed
   - Click "Import Questions" to add to assessment

3. **Save to Database**:
   - **Important**: After import, you MUST click "Create Assessment" to save the questions to the database
   - A yellow warning banner will appear indicating data needs to be saved
   - The imported questions will be visible in your assessment form
   - Click "Create Assessment" to permanently store in DynamoDB

### Sample CSV Format
```csv
id,text,optionA,optionB,optionC,optionD,correctAnswer,marks
Q1,What is the capital of France?,London,Berlin,Paris,Madrid,Paris,1
Q2,What is 2 + 2?,3,4,5,6,4,1
```

## Error Handling

### Validation Errors
- **Missing Required Fields**: Highlights missing data
- **Invalid Correct Answer**: Shows when answer doesn't match options
- **Invalid Marks**: Indicates non-numeric or negative values
- **Duplicate IDs**: Prevents ID conflicts within file and existing questions

### User Feedback
- **Inline Error Messages**: Specific error details for each question
- **Summary Statistics**: Overall validation status
- **Success Confirmation**: Clear indication of successful import
- **Loading States**: Visual feedback during processing

## Backend Integration

The feature prepares questions in the format expected by the assessment service:
```javascript
{
  id: string,
  questionId: string,
  questionNumber: number,
  question: string,
  options: string[],
  correctAnswer: string,
  marks: number,
  points: number,
  entityType: 'mcq',
  category: 'MCQ',
  difficulty: 'MEDIUM',
  subcategory: 'General'
}
```

This matches the backend schema which expects a `question` field rather than `text` for question content.

## Testing

### Test Files
- `sample_questions.csv` - Sample data for testing the feature

### Test Scenarios
1. Valid CSV with all required fields
2. CSV with missing required fields
3. CSV with invalid correct answers
4. CSV with duplicate IDs
5. CSV with existing IDs in assessment
6. Large CSV files
7. Files with special characters

## Future Enhancements

### Potential Improvements
- Support for programming questions import
- Template download functionality
- Batch editing of imported questions
- Import history and tracking
- Partial import (select specific questions)
- Export validation report

### Advanced Features
- Excel (.xlsx) file support
- Google Sheets direct integration
- Question categorization during import
- Difficulty level assignment
- Image support in questions
- Multi-language question support

## Dependencies

### External Libraries
- `lucide-react` - Icons (already in project)
- Native browser File API - CSV parsing
- React hooks - State management

### No Additional Dependencies Required
The implementation uses only native browser APIs and existing project dependencies.