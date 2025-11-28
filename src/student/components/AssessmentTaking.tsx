import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AssessmentTaking.css';
import judge0Service, { type SubmissionResult } from '../../services/judge0.service';
import StudentAssessmentService from '../../services/student.assessment.service';
import ResultsService from '../../services/results.service';

// Define interfaces for assessment data
interface MCQOption {
  id: string;
  text: string;
}

interface MCQQuestion {
  questionId: string;
  question: string;
  options: MCQOption[];
  correctAnswer?: string[] | string;
  points?: number;
  difficulty?: string;
  subcategory?: string;
  examples?: { input: string; output: string }[];
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface CodingQuestion {
  questionId: string;
  question: string;
  starterCode?: string;
  testCases?: TestCase[];
  points?: number;
  difficulty?: string;
  subcategory?: string;
  examples?: { input: string; output: string }[];
}

interface AssessmentConfiguration {
  duration: number;
  maxAttempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  totalQuestions: number;
}

interface AssessmentEntity {
  type: string;
  batch: string;
  description?: string;
}

interface AssessmentScheduling {
  startDate: string;
  endDate: string;
  timezone: string;
}

interface AssessmentData {
  assessmentId: string;
  title: string;
  description: string;
  category: string[];
  configuration: AssessmentConfiguration;
  entities: AssessmentEntity[];
  scheduling: AssessmentScheduling;
  questions: (MCQQuestion | CodingQuestion)[];
  mcqQuestions?: MCQQuestion[];
  codingQuestions?: CodingQuestion[];
  allQuestions?: (MCQQuestion | CodingQuestion)[];
  // Add other fields as needed
}

const AssessmentTaking: React.FC = () => {
  // Get assessmentId from URL params
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  
  // State for assessment data
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState<'mcq' | 'coding'>('mcq');
  
  // State for showing language selection alert
  const [showLanguageAlert, setShowLanguageAlert] = useState<boolean>(true);
  
  // State for timer
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // State for MCQ section
  const [currentMCQIndex, setCurrentMCQIndex] = useState<number>(0);
  const [mcqAnswers, setMcqAnswers] = useState<{[key: string]: number}>({});
  
  // State for coding section
  const [currentCodingIndex, setCurrentCodingIndex] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<{[key: string]: {[key: string]: string}}>({});
  const [executionResult, setExecutionResult] = useState<{[key: string]: SubmissionResult}>({});
  const [testCaseResults, setTestCaseResults] = useState<{[key: string]: {passed: boolean, actualOutput: string, expectedOutput: string, input: string}[]}>({});
  const [allTestCasesPassed, setAllTestCasesPassed] = useState<boolean>(false);
  // State to track which coding challenges have been successfully executed without errors
  const [successfulExecutions, setSuccessfulExecutions] = useState<Record<string, boolean>>({});
  const [isAutoRunEnabled, setIsAutoRunEnabled] = useState<boolean>(false); // Disable auto-run by default
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  
  // State for assessment completion
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);
  const [mcqResults, setMcqResults] = useState<any>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const autoRunTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedData = useRef(false); // To prevent multiple API calls
  
  // Memoized function to extract questions
  const { mcqQuestions, codingChallenges } = React.useMemo(() => {
    if (!assessmentData) {
      return { mcqQuestions: [], codingChallenges: [] };
    }
    
    // Extract MCQ questions from assessment data
    const mcqQuestions: MCQQuestion[] = assessmentData?.mcqQuestions || 
      assessmentData?.questions?.filter((q): q is MCQQuestion => 'options' in q) || [];
    
    // Extract coding challenges from assessment data
    const codingChallenges: CodingQuestion[] = assessmentData?.codingQuestions || 
      assessmentData?.questions?.filter((q): q is CodingQuestion => 'starterCode' in q || 'testCases' in q) || [];
    
    return { mcqQuestions, codingChallenges };
  }, [assessmentData]);
  
  // Get current challenge safely
  const currentChallenge = codingChallenges[currentCodingIndex];
  
  // Preprocess React code to make it runnable in a Node.js environment
  const preprocessReactCode = (code: string): string => {
    if (!code.trim()) return code;
    
    // Simple approach: Remove JSX syntax and extract JavaScript logic
    try {
      // Remove comments first
      let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      
      // Extract JavaScript logic by removing JSX tags but preserving the code structure
      // This is a simplified approach for basic React code testing
      
      // Extract function definitions (more comprehensive)
      const functionRegex = /(function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?})|(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?})|(let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?})|(var\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?})/g;
      const functionMatches = cleanCode.match(functionRegex) || [];
      
      // Extract variable declarations
      const varRegex = /(const|let|var)\s+\w+\s*=\s*[^;]*;/g;
      const varMatches = cleanCode.match(varRegex) || [];
      
      // Extract console.log statements
      const logRegex = /console\.log\([^;]*\);/g;
      const logMatches = cleanCode.match(logRegex) || [];
      
      // Combine all extracted JavaScript
      let extractedJS = '';
      
      // Add functions
      if (functionMatches.length > 0) {
        extractedJS += functionMatches.join('\n\n') + '\n\n';
      }
      
      // Add variables
      if (varMatches.length > 0) {
        extractedJS += varMatches.join('\n') + '\n\n';
      }
      
      // Add console logs
      if (logMatches.length > 0) {
        extractedJS += logMatches.join('\n') + '\n\n';
      }
      
      // If we found JavaScript logic, execute it
      if (extractedJS.trim()) {
        return `
// Extracted JavaScript logic from React code
${extractedJS}
console.log("React JavaScript logic executed successfully");
`;
      }
      
      // Fallback: If no clear JavaScript logic found, just run the code with error handling
      // But first, try to make JSX compatible by commenting out JSX lines
      const lines = code.split('\n');
      const processedLines = lines.map(line => {
        // If line contains JSX tags, comment it out
        if (line.trim().startsWith('<') && line.includes('>')) {
          return '// ' + line; // Comment out JSX lines
        }
        return line;
      });
      
      return `
// Processed React code (JSX lines commented out)
try {
  ${processedLines.join('\n')}
  console.log("React code processed successfully");
} catch (error) {
  console.error("Error in React code:", error.message);
}
`;
      
    } catch (error) {
      // If all else fails, provide a safe fallback
      return `
console.log("React/JSX code detected:");
console.log("In a browser environment, this would render a React component");
console.log("Component content preview:");
console.log(\`${code.substring(0, 200)}${code.length > 200 ? '...' : ''}\`);
`;
    }
  };
  
  // Preprocess HTML code to make it runnable
  const preprocessHtmlCode = (code: string): string => {
    if (!code.trim()) return code;
    
    // Check if this is HTML with script tags
    const scriptMatches = code.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    
    if (scriptMatches && scriptMatches.length > 0) {
      // Extract JavaScript from script tags
      let jsCode = '';
      scriptMatches.forEach(match => {
        const innerCode = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        if (innerCode) {
          jsCode += innerCode + '\n';
        }
      });
      
      if (jsCode.trim()) {
        return `
// Extracted JavaScript from HTML
try {
  ${jsCode}
  console.log("JavaScript from HTML executed successfully");
} catch (error) {
  console.error("Error in HTML JavaScript:", error.message);
}
`;
      }
    }
    
    // If no script tags or no executable JavaScript, treat as plain text
    return `
// HTML code detected
console.log("HTML content:");
console.log(\`${code.substring(0, 200)}${code.length > 200 ? '...' : ''}\`);
console.log("In a browser environment, this would render as HTML");
`;
  };

  // Run code function with proper type checking
  const runCode = useCallback(async (inputType: 'test' | 'example' | 'custom' = 'test') => {
    // Ensure we have a valid challenge
    if (!currentChallenge) {
      return;
    }
    
    // Get current code for the challenge and language
    let currentCode = code[currentChallenge.questionId]?.[selectedLanguage] || '';
    
    // Preprocess code for specific languages
    if (selectedLanguage === 'react') {
      // For React, we need to wrap the code in a basic React environment simulation
      // Since Judge0 can't run React directly, we'll convert it to runnable JavaScript
      currentCode = preprocessReactCode(currentCode);
    } else if (selectedLanguage === 'html') {
      // For HTML, we might want to wrap it in a basic HTML structure
      currentCode = preprocessHtmlCode(currentCode);
    }
    
    try {
      setIsLoading(true);
      
      if (inputType === 'test') {
        // Run all test cases
        await runTestCases(currentCode);
      } else {
        // Get input based on input type
        let input = '';
        if (inputType === 'example' && currentChallenge.examples && currentChallenge.examples[0]) {
          input = currentChallenge.examples[0].input;
        } else if (inputType === 'custom') {
          input = customInput;
        }
        
        // Execute code using Judge0 service
        const result = await judge0Service.executeCode(currentCode, selectedLanguage, input);
        
        setExecutionResult(prev => ({
          ...prev,
          [currentChallenge.questionId]: result
        }));
        
        // Mark as successful execution if no compilation or runtime errors
        if (!result.compile_output && !result.stderr) {
          setSuccessfulExecutions(prev => ({
            ...prev,
            [currentChallenge.questionId]: true
          }));
        } else {
          // Mark as unsuccessful execution if there are errors
          setSuccessfulExecutions(prev => ({
            ...prev,
            [currentChallenge.questionId]: false
          }));
        }
      }
    } catch (error) {
      // Provide a more user-friendly error message for rate limiting
      let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. The system is temporarily busy. Please wait a moment and try again.';
      } else if (errorMessage.includes('API key')) {
        errorMessage = 'Judge0 API is not configured properly. Please contact the system administrator.';
      } else if (errorMessage.includes('Failed to submit code')) {
        errorMessage = 'Failed to connect to the code execution service. Please check your internet connection and try again.';
      }
      
      setExecutionResult(prev => ({
        ...prev,
        [currentChallenge.questionId]: {
          status: { id: 0, description: 'Error' },
          stdout: '',
          stderr: errorMessage,
          compile_output: '',
          message: '',
          time: '',
          memory: 0
        }
      }));
      
      // Mark as unsuccessful execution due to error
      setSuccessfulExecutions(prev => ({
        ...prev,
        [currentChallenge.questionId]: false
      }));
    } finally {
      setIsLoading(false);
    }
  }, [currentChallenge, code, selectedLanguage, customInput]);
  
  // Utility function for delay
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  
  // Run all test cases for current challenge
  const runTestCases = useCallback(async (codeToTest: string) => {
    try {
      const currentChallenge = codingChallenges[currentCodingIndex];
      if (!currentChallenge) return;
      
      // Check if testCases exist before accessing
      if (!currentChallenge.testCases) {
        // Mark as successful execution if no test cases
        setSuccessfulExecutions(prev => ({
          ...prev,
          [currentChallenge.questionId]: true
        }));
        return;
      }
      
      const results: {passed: boolean, actualOutput: string, expectedOutput: string, input: string}[] = [];
      
      // Run each test case with delay to avoid rate limiting
      for (let i = 0; i < currentChallenge.testCases.length; i++) {
        const testCase = currentChallenge.testCases[i];
        
        try {
          // Preprocess input for array inputs in specific languages
          let processedInput = testCase.input;
          
          // For Python and JavaScript, convert array string to actual array if needed
          if ((selectedLanguage === 'python' || selectedLanguage === 'javascript') && 
              testCase.input.startsWith('[') && testCase.input.endsWith(']')) {
            // Input is already in correct format for these languages
          }
          
          const result = await judge0Service.executeCode(codeToTest, selectedLanguage, processedInput);
          
          // Normalize output for comparison (remove trailing newlines and whitespace)
          const actualOutput = (result.stdout || '').trim();
          const expectedOutput = testCase.expectedOutput.trim();
          
          // Check if test case passed
          const passed = actualOutput === expectedOutput;
          
          results.push({
            passed,
            actualOutput,
            expectedOutput,
            input: testCase.input
          });
          
          // Add delay between test cases to avoid rate limiting (except for the last one)
          if (i < currentChallenge.testCases.length - 1) {
            await delay(1000); // 1 second delay
          }
        } catch (error) {
          let errorMessage = 'Error occurred';
          if (error instanceof Error) {
            // Provide more specific error messages
            if (error.message.includes('rate limit')) {
              errorMessage = 'Rate limit exceeded. Please wait before submitting more requests.';
            } else if (error.message.includes('submit code')) {
              errorMessage = 'Failed to submit code for execution. Check your code syntax.';
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Code execution timed out.';
            } else if (error.message.includes('API key')) {
              errorMessage = 'Judge0 API is not configured properly. Please contact the system administrator.';
            } else {
              errorMessage = error.message;
            }
          }
          results.push({
            passed: false,
            actualOutput: errorMessage,
            expectedOutput: testCase.expectedOutput,
            input: testCase.input
          });
          
          // If it's a rate limit error, stop executing more test cases
          if (errorMessage.includes('rate limit') || errorMessage.includes('API key')) {
            break;
          }
          
          // Add delay between test cases to avoid rate limiting (except for the last one)
          if (i < currentChallenge.testCases.length - 1) {
            await delay(1000); // 1 second delay
          }
        }
      }
      
      // Update test case results
      setTestCaseResults(prev => ({
        ...prev,
        [currentChallenge.questionId]: results
      }));
      
      // Check if all test cases passed
      const allPassed = results.every(result => result.passed);
      setAllTestCasesPassed(allPassed);
      
      // Mark as successful execution if no compilation or runtime errors
      setSuccessfulExecutions(prev => ({
        ...prev,
        [currentChallenge.questionId]: true
      }));
      
      // Show result in execution panel
      setExecutionResult(prev => ({
        ...prev,
        [currentChallenge.questionId]: {
          status: { id: allPassed ? 3 : 4, description: allPassed ? 'All Tests Passed' : 'Some Tests Failed' },
          stdout: `Ran ${results.length} test cases. ${results.filter(r => r.passed).length} passed, ${results.filter(r => !r.passed).length} failed.`,
          stderr: '',
          compile_output: '',
          message: '',
          time: '',
          memory: 0
        }
      }));
      
    } catch (error) {
      // Provide a more user-friendly error message for rate limiting
      let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. The system is temporarily busy. Please wait a moment and try again.';
      } else if (errorMessage.includes('API key')) {
        errorMessage = 'Judge0 API is not configured properly. Please contact the system administrator.';
      } else if (errorMessage.includes('Failed to submit code')) {
        errorMessage = 'Failed to connect to the code execution service. Please check your internet connection and try again.';
      }
      
      setExecutionResult(prev => ({
        ...prev,
        [currentChallenge?.questionId || 'default']: {
          status: { id: 0, description: 'Error' },
          stdout: '',
          stderr: errorMessage,
          compile_output: '',
          message: '',
          time: '',
          memory: 0
        }
      }));
      
      // Mark as unsuccessful execution due to error
      if (currentChallenge?.questionId) {
        setSuccessfulExecutions(prev => ({
          ...prev,
          [currentChallenge.questionId]: false
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [codingChallenges, currentCodingIndex, selectedLanguage]);
  
  // Fetch assessment data when component mounts or assessmentId changes
  useEffect(() => {
    // Prevent multiple calls to the API
    if (hasFetchedData.current || !assessmentId) {
      if (!assessmentId) {
        setError('Assessment ID is required');
      }
      return;
    }
    
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        hasFetchedData.current = true; // Mark as fetched
        
        // Validate assessment ID before making API call
        if (!assessmentId) {
          setError('Assessment ID is required');
          setLoading(false);
          return;
        }
        
        console.log(`Fetching assessment data for ID: ${assessmentId}`);
        // Use the NEW endpoint to automatically fetch assessment with questions
        const response = await StudentAssessmentService.getAssessmentWithQuestions(assessmentId);
        
        if (response.success) {
          // Add additional validation to ensure we have the required data
          if (!response.data) {
            setError('Assessment not found. Please check if the assessment exists and you have access to it.');
            setLoading(false);
            return;
          }
          
          // Extract assessment and questions from the new response format
          const { assessment, questions } = response.data;
          
          // Check if assessment exists but has no questions
          if (!questions || questions.length === 0) {
            console.log(`Assessment ${assessmentId} exists but has no questions`);
          }
          
          // Transform the data to match our existing interface
          const transformedData = {
            ...assessment,
            questions: questions || [],
            mcqQuestions: questions?.filter((q: any) => q.entityType === 'mcq') || [],
            codingQuestions: questions?.filter((q: any) => q.entityType === 'coding') || []
          };
          
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
          
          setAssessmentData(transformedData);
          
          // Set timer based on assessment configuration
          if (assessment?.configuration?.duration) {
            setTimeLeft(assessment.configuration.duration * 60); // Convert minutes to seconds
          }
        } else {
          // Handle specific error cases
          if (response.message && response.message.includes('not found')) {
            setError(`Assessment not found: ${response.message}`);
          } else {
            setError(response.message || 'Failed to load assessment data');
          }
        }
      } catch (err: any) {
        console.error('Error fetching assessment data:', err);
        // Provide more specific error messages
        if (err.message && err.message.includes('not found')) {
          setError(`Assessment not found: ${err.message}`);
        } else if (err.message && err.message.includes('connect')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else if (err.message && err.message.includes('Authentication failed')) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(err.message || 'Failed to load assessment data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [assessmentId]); // Only depend on assessmentId
  
  // Set the active tab based on available questions
  useEffect(() => {
    if (assessmentData) {
      // If we have coding challenges, default to coding tab
      if (codingChallenges.length > 0) {
        setActiveTab('coding');
      } 
      // Otherwise, if we have MCQ questions, default to mcq tab
      else if (mcqQuestions.length > 0) {
        setActiveTab('mcq');
      }
    }
  }, [assessmentData, codingChallenges.length, mcqQuestions.length]);
  
  // Languages supported by Judge0
  const languages = [
    { id: 'html', name: 'HTML' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'c', name: 'C' },
    { id: 'cpp', name: 'C++' },
    { id: 'csharp', name: 'C#' },
    { id: 'php', name: 'PHP' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'react', name: 'React' },
    { id: 'flutter', name: 'Flutter' }
  ];
  
  // Initialize code state for each challenge and language
  useEffect(() => {
    if (codingChallenges.length > 0) {
      const initialCode: {[key: string]: {[key: string]: string}} = {};
      const initialTestCases: {[key: string]: {passed: boolean, actualOutput: string, expectedOutput: string, input: string}[]} = {};
      
      codingChallenges.forEach(challenge => {
        if (challenge.questionId) {
          initialCode[challenge.questionId] = {};
          languages.forEach(lang => {
            // Use starter code if available, otherwise empty string
            initialCode[challenge.questionId][lang.id] = challenge.starterCode || '';
          });
          
          // Initialize empty test case results
          initialTestCases[challenge.questionId] = [];
        }
      });
      
      setCode(initialCode);
      setTestCaseResults(initialTestCases);
    }
  }, [codingChallenges]); // Only depend on codingChallenges array
  
  // Ensure code state is properly initialized for current challenge and language
  useEffect(() => {
    // Check if code state exists for current challenge and language
    if (code && Object.keys(code).length > 0) {
      if (!code[codingChallenges[currentCodingIndex]?.questionId]) {
        setCode(prev => ({
          ...prev,
          [codingChallenges[currentCodingIndex]?.questionId]: {}
        }));
      } else if (!code[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage]) {
        setCode(prev => ({
          ...prev,
          [codingChallenges[currentCodingIndex]?.questionId]: {
            ...prev[codingChallenges[currentCodingIndex]?.questionId],
            [selectedLanguage]: ''
          }
        }));
      }
    }
  }, [code, currentCodingIndex, selectedLanguage, codingChallenges]);
  
  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto-submit when time is up
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoRunTimeoutRef.current) {
        clearTimeout(autoRunTimeoutRef.current);
      }
    };
  }, []);
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle MCQ answer selection
  const handleMCQAnswerSelect = (optionIndex: number) => {
    console.log('MCQ Answer Selected:', {
      optionIndex,
      currentQuestionId: mcqQuestions[currentMCQIndex]?.questionId,
      currentQuestion: mcqQuestions[currentMCQIndex]
    });
    
    setMcqAnswers(prev => ({
      ...prev,
      [mcqQuestions[currentMCQIndex]?.questionId]: optionIndex
    }));
  };
  
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
  
  // Handle navigation between coding challenges
  const handleCodingNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentCodingIndex > 0) {
      setCurrentCodingIndex(currentCodingIndex - 1);
    } else if (direction === 'next' && currentCodingIndex < codingChallenges.length - 1) {
      setCurrentCodingIndex(currentCodingIndex + 1);
    }
  };
  
  // Handle code change with auto-run debounce
  const handleCodeChange = useCallback((newCode: string) => {
    // Check if the indices are valid
    if (currentCodingIndex < 0 || currentCodingIndex >= codingChallenges.length) {
      return;
    }
    
    // Ensure we have proper state structure
    setCode(prev => {
      const newState = { ...prev };
      
      // Ensure challenge exists
      if (!newState[codingChallenges[currentCodingIndex]?.questionId]) {
        newState[codingChallenges[currentCodingIndex]?.questionId] = {};
      }
      
      // Ensure language exists for this challenge
      if (!newState[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage]) {
        newState[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage] = '';
      }
      
      // Update the code
      newState[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage] = newCode;
      
      return newState;
    });
    
    // If there was an error previously and user is typing, clear the error
    if (executionResult[codingChallenges[currentCodingIndex]?.questionId]?.stderr) {
      setExecutionResult(prev => {
        const newResult = { ...prev };
        delete newResult[codingChallenges[currentCodingIndex]?.questionId];
        return newResult;
      });
    }
    
    // Auto-run if enabled
    if (isAutoRunEnabled) {
      // Clear previous timeout
      if (autoRunTimeoutRef.current) {
        clearTimeout(autoRunTimeoutRef.current);
      }
      
      // Set new timeout
      autoRunTimeoutRef.current = setTimeout(() => {
        runCode('example');
      }, 800);
    }
  }, [currentCodingIndex, codingChallenges, selectedLanguage, executionResult, isAutoRunEnabled, runCode]);
  
  // Handle language selection and dismiss alert
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageAlert(false);
  };

  // Calculate MCQ score
  const calculateMCQScore = () => {
    let score = 0;
    let maxScore = 0;
    const answers: any = {};
    
    mcqQuestions.forEach((question, index) => {
      maxScore += question.points || 1;
      answers[question.questionId] = {
        selectedOption: mcqAnswers[question.questionId],
        correctOption: question.correctAnswer,
        points: question.points || 1
      };
      
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
    });
    
    return { score, maxScore, answers };
  };

  // Handle submit
  const handleSubmit = async () => {
    // Remove the test case check and allow submission for all assessments
    try {
      // Calculate scores
      const { score: mcqScore, maxScore: mcqMaxScore, answers } = calculateMCQScore();
      const codingScore = codingChallenges.length; // Simplified - 1 point per coding challenge
      const codingMaxScore = codingChallenges.length;
      
      const totalScore = mcqScore + codingScore;
      const totalMaxScore = mcqMaxScore + codingMaxScore;
      const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
      
      // Store MCQ results for UI feedback
      setMcqResults(answers);
      setSubmitted(true);
      
      // Get user info from context or local storage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user.sub || user.username || 'unknown_student';
      const studentEmail = user.email || '';
      const studentName = user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim() || studentEmail || studentId;
      
      // Prepare result data
      const resultData = {
        assessmentId: assessmentData?.assessmentId,
        studentId,
        studentEmail,
        studentName,
        answers,
        score: totalScore,
        maxScore: totalMaxScore,
        percentage,
        timeTaken: 3600 - timeLeft, // Time taken in seconds
        codingSubmissions: code,
        department: assessmentData?.entities?.[0]?.type || 'Unknown'
      };
      
      // Save result
      await ResultsService.saveAssessmentResult(resultData);
      
      // Navigate to success page with assessment data
      navigate('/student/assessment-success', {
        state: {
          assessmentTitle: assessmentData?.title,
          score: totalScore,
          totalScore: totalMaxScore
        }
      });
      
      setIsAssessmentCompleted(true);
      // Notify parent component that assessment is completed
      if (window.parent) {
        window.parent.postMessage({ type: 'ASSESSMENT_COMPLETED' }, '*');
      }
    } catch (error: any) {
      console.error('Error saving assessment result:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Provide more specific error messages
      let errorMessage = 'Assessment completed but there was an error saving your results. Please contact support.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again to save your results.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while saving your results. Please try again or contact support.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error occurred while saving your results. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = `Error saving results: ${error.response.data.message}`;
      }
      
      alert(errorMessage);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="assessment-taking-container">
        <div className="loading-container">
          <h2>Loading Assessment...</h2>
          <p>Please wait while we prepare your assessment.</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="assessment-taking-container">
        <div className="error-container">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Render if no assessment data
  if (!assessmentData) {
    return (
      <div className="assessment-taking-container">
        <div className="error-container">
          <h2>Assessment Not Found</h2>
          <p>The requested assessment could not be found.</p>
        </div>
      </div>
    );
  }
  
  // Render if no questions
  if (assessmentData && (!assessmentData.questions || assessmentData.questions.length === 0)) {
    return (
      <div className="assessment-taking-container">
        <div className="error-container">
          <h2>No Questions Available</h2>
          <p>This assessment does not contain any questions yet.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`assessment-taking ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header with timer and navigation buttons */}
      <div className="assessment-header">
        <div className="timer-section">
          <span className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <div className="header-controls">
          {/* Navigation buttons as tabs near timer */}
          <button 
            className={`section-btn ${activeTab === 'mcq' ? 'active' : ''} ${mcqQuestions.length === 0 ? 'disabled' : ''}`}
            onClick={() => mcqQuestions.length > 0 && setActiveTab('mcq')}
            disabled={mcqQuestions.length === 0}
          >
            MCQ
          </button>
          <button 
            className={`section-btn ${activeTab === 'coding' ? 'active' : ''} ${codingChallenges.length === 0 ? 'disabled' : ''}`}
            onClick={() => codingChallenges.length > 0 && setActiveTab('coding')}
            disabled={codingChallenges.length === 0}
          >
            Coding
          </button>
          
          <button 
            className="fullscreen-btn"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'mcq' ? (
          <div className="mcq-section">
            <div className="mcq-header">
              <div className="progress-indicator">
                <span>Question {currentMCQIndex + 1} of {mcqQuestions.length}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((currentMCQIndex + 1) / mcqQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="question-container">
              <div className="question-content">
                <div className="question-text small">
                  {mcqQuestions[currentMCQIndex]?.question}
                </div>
                
                <div className="options-container small">
                  {mcqQuestions[currentMCQIndex]?.options.map((option, index) => {
                    // Check if this option should show feedback
                    const questionId = mcqQuestions[currentMCQIndex]?.questionId;
                    const showFeedback = submitted && mcqResults && mcqResults[questionId];
                    const isSelected = mcqAnswers[questionId] === index;
                    const isCorrectOption = Array.isArray(mcqQuestions[currentMCQIndex]?.correctAnswer) 
                      ? mcqQuestions[currentMCQIndex]?.correctAnswer.includes(String.fromCharCode(65 + index))
                      : mcqQuestions[currentMCQIndex]?.correctAnswer === String.fromCharCode(65 + index);
                    
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
                    
                    return (
                      <div
                        key={index}
                        className={optionClass}
                        onClick={() => {
                          // Only allow selection if not submitted
                          if (!submitted) {
                            handleMCQAnswerSelect(index);
                          }
                        }}
                      >
                        <div className={`radio-button ${mcqAnswers[questionId] === index ? 'selected' : ''}`}>
                          {mcqAnswers[questionId] === index && <div className="radio-button-inner"></div>}
                        </div>
                        <span className="option-text">{option.text}</span>
                        {showFeedback && isSelected && mcqResults[questionId].isCorrect && (
                          <span className="feedback-icon correct">✓</span>
                        )}
                        {showFeedback && isSelected && !mcqResults[questionId].isCorrect && (
                          <span className="feedback-icon incorrect">✗</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Previous button on left side corner */}
            <button 
              className="nav-btn prev left-corner"
              onClick={() => handleMCQNavigation('prev')}
              disabled={currentMCQIndex === 0}
            >
              Previous
            </button>
            
            {/* Save and Next button in the middle */}
            <button 
              className="nav-btn next save-next"
              onClick={() => handleMCQNavigation('next')}
              disabled={currentMCQIndex === mcqQuestions.length - 1 && codingChallenges.length === 0}
            >
              {currentMCQIndex === mcqQuestions.length - 1 ? 'Submit' : 'Save and Next'}
            </button>
            
            {/* Submit button on right side corner - only show if no coding questions */}
            {codingChallenges.length === 0 && (
              <button 
                className="submit-btn small right-corner"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
            
            {/* 6x6 grid on the right side corner */}
            <div className="question-grid-container">
              {mcqQuestions.map((_, index) => (
                <div 
                  key={index}
                  className={`question-number-circle ${mcqAnswers[mcqQuestions[index]?.questionId] !== undefined ? 'answered' : ''} ${index === currentMCQIndex ? 'current' : ''}`}
                  onClick={() => setCurrentMCQIndex(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="coding-section">
            <div className="coding-header">
              <h2 className="challenge-title">{codingChallenges[currentCodingIndex]?.question}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select 
                  className="language-selector"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                <button 
                  className="control-btn run-btn"
                  onClick={() => runCode('custom')}
                  disabled={isLoading || !code || !code[codingChallenges[currentCodingIndex]?.questionId] || !code[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage] || code[codingChallenges[currentCodingIndex]?.questionId][selectedLanguage].trim() === ''}
                >
                  {isLoading ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>
            
            {/* Language selection alert */}
            {showLanguageAlert && (
              <div className="language-alert-overlay">
                <div className="language-alert-modal">
                  <h3>Please Select a Programming Language</h3>
                  <p>Choose a language to start coding:</p>
                  <div className="language-options">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        className="language-option-btn"
                        onClick={() => handleLanguageSelect(lang.id)}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                  <p className="note">You can change the language later using the dropdown in the header.</p>
                </div>
              </div>
            )}
            
            <div className="coding-content">
              <div className="problem-section">
                <div className="problem-description">
                  {codingChallenges[currentCodingIndex]?.question || 'No description available'}
                </div>
                
                <div className="examples">
                  <h3>Examples:</h3>
                  {codingChallenges[currentCodingIndex]?.examples?.length ? (
                    codingChallenges[currentCodingIndex]?.examples?.map((example, index) => (
                      <div key={index} className="example-item">
                        <div className="example-label">Example {index + 1}:</div>
                        <div className="example-content">
                          <strong>Input:</strong> {example.input}
                          <br />
                          <strong>Output:</strong> {example.output}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No examples available</p>
                  )}
                </div>
                
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
              </div>
              
              <div className="right-column">
                <div className="editor-section">
                  <div className="editor-header">
                    <div>Code Editor</div>
                    <div className="editor-controls">
                    </div>
                  </div>
                  <textarea
                    ref={codeEditorRef}
                    className="code-editor"
                    value={code[codingChallenges[currentCodingIndex]?.questionId]?.[selectedLanguage] || ''}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onPaste={(e) => {
                      // Handle paste event to ensure proper scrolling
                      setTimeout(() => {
                        if (codeEditorRef.current) {
                          codeEditorRef.current.scrollTop = codeEditorRef.current.scrollHeight;
                        }
                      }, 10);
                    }}
                    onKeyDown={(e) => {
                      // Handle tab key for better code editing experience
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        const { selectionStart, selectionEnd } = e.target as HTMLTextAreaElement;
                        const newValue = 
                          code[codingChallenges[currentCodingIndex]?.questionId]?.[selectedLanguage].substring(0, selectionStart) + 
                          '    ' + 
                          code[codingChallenges[currentCodingIndex]?.questionId]?.[selectedLanguage].substring(selectionEnd);
                        
                        handleCodeChange(newValue);
                        
                        // Move cursor to after the inserted spaces
                        setTimeout(() => {
                          if (codeEditorRef.current) {
                            codeEditorRef.current.selectionStart = selectionStart + 4;
                            codeEditorRef.current.selectionEnd = selectionStart + 4;
                          }
                        }, 10);
                      }
                    }}
                    placeholder={selectedLanguage === 'java' 
                      ? `Write your Java code here...
Example:
public class Main {
    public static void main(String[] args) {
        // Your code here
    }
}` 
                      : selectedLanguage === 'python'
                      ? `Write your Python code here...
Example:
print("Hello, World!")`
                      : selectedLanguage === 'cpp'
                      ? `Write your C++ code here...
Example:
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
                      : `Write your ${languages.find(l => l.id === selectedLanguage)?.name} code here...`}
                  />
                  
                  {/* Custom input section */}
                  <div className="custom-input-section">
                    <h4>Custom Input:</h4>
                    <textarea
                      className="custom-input"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom input for your code here..."
                    />
                  </div>
                </div>
                
                {/* Output container below the code editor */}
                <div className="output-section">
                  <div className="result-header">Execution Result</div>
                  <div className="result-content">
                    {isLoading ? (
                      <div className="result-loading">
                        <div className="spinner"></div>
                        Executing code...
                      </div>
                    ) : executionResult[codingChallenges[currentCodingIndex]?.questionId] ? (
                      <div className="result-output">
                        <strong>Status:</strong> {executionResult[codingChallenges[currentCodingIndex]?.questionId]?.status?.description || 'Unknown'}
                        <br />
                        {executionResult[codingChallenges[currentCodingIndex]?.questionId]?.stdout ? (
                          <>
                            <strong>Output:</strong>
                            <br />
                            <pre>{executionResult[codingChallenges[currentCodingIndex]?.questionId]?.stdout}</pre>
                          </>
                        ) : executionResult[codingChallenges[currentCodingIndex]?.questionId]?.compile_output ? (
                          <>
                            <strong>Compilation Error:</strong>
                            <br />
                            <pre className="error-output">{executionResult[codingChallenges[currentCodingIndex]?.questionId]?.compile_output}</pre>
                          </>
                        ) : executionResult[codingChallenges[currentCodingIndex]?.questionId]?.stderr ? (
                          <>
                            <strong>Runtime Error:</strong>
                            <br />
                            <pre className="error-output">{executionResult[codingChallenges[currentCodingIndex]?.questionId]?.stderr}</pre>
                          </>
                        ) : (
                          <>
                            <strong>Output:</strong>
                            <br />
                            No output
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="result-output">
                        Run your code to see the output here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit button that only appears when code runs without errors */}
            {executionResult[codingChallenges[currentCodingIndex]?.questionId] && 
             successfulExecutions[codingChallenges[currentCodingIndex]?.questionId] && (
              <div className="submission-section">
                <button 
                  className="submit-btn coding-submit"
                  onClick={handleSubmit}
                >
                  Submit Code & Finish Assessment
                </button>
                
                {/* Success message when all coding challenges are completed */}
                {codingChallenges.every(challenge => successfulExecutions[challenge.questionId]) && (
                  <div className="success-message">
                    <p>✓ All coding challenges executed successfully! Ready to submit.</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="navigation-buttons">
              <button 
                className="nav-btn prev"
                onClick={() => handleCodingNavigation('prev')}
                disabled={currentCodingIndex === 0}
              >
                Previous Challenge
              </button>
              <button 
                className="nav-btn next right-corner"
                onClick={() => handleCodingNavigation('next')}
                disabled={currentCodingIndex === codingChallenges.length - 1}
              >
                {currentCodingIndex === codingChallenges.length - 1 ? 'Last Challenge' : 'Next Challenge'}
              </button>
              
              {/* Auto-submit button when on last challenge and all executed successfully */}
              {currentCodingIndex === codingChallenges.length - 1 && 
               codingChallenges.every(challenge => successfulExecutions[challenge.questionId]) && (
                <button 
                  className="submit-btn coding-submit auto-submit"
                  onClick={handleSubmit}
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default AssessmentTaking;