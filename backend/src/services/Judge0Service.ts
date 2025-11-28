import axios from 'axios';

interface TestCase {
  input: string;
  expectedOutput: string;
  marks: number;
}

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Response {
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
}

class Judge0Service {
  private readonly JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
  private readonly API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
  private readonly API_KEY = process.env.JUDGE0_API_KEY || '';
  
  private readonly languageIds: Record<string, number> = {
    'python': 71,
    'javascript': 63,
    'java': 62,
    'cpp': 54,
    'c': 50
  };

  /**
   * Execute code against test cases using Judge0 API
   */
  async executeCodeWithTestCases(sourceCode: string, language: string, testCases: TestCase[]): Promise<any> {
    try {
      // Handle case where there are no test cases
      if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
        console.log('No test cases provided, executing code without test cases');
        
        const languageId = this.languageIds[language.toLowerCase()] || 63; // Default to JavaScript
        
        // Execute code without test cases (just run it)
        const submission: Judge0Submission = {
          source_code: sourceCode,
          language_id: languageId
        };

        // Submit code to Judge0
        const submissionResponse = await axios.post(`${this.JUDGE0_API_URL}/submissions/?base64_encoded=false&wait=true`, submission, {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.API_KEY,
            'X-RapidAPI-Host': this.API_HOST
          }
        });

        const result: Judge0Response = submissionResponse.data;
        
        // Return result without test case evaluation
        return {
          success: result.status.id === 3, // Accepted status
          status: result.status.description,
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          compile_output: result.compile_output || '',
          message: result.message || '',
          testResults: []
        };
      }
      
      const languageId = this.languageIds[language.toLowerCase()] || 63; // Default to JavaScript
      const results = [];
      let totalMarks = 0;
      let obtainedMarks = 0;

      // Run each test case
      for (const testCase of testCases) {
        totalMarks += testCase.marks || 1; // Default to 1 mark if not specified
        
        const submission: Judge0Submission = {
          source_code: sourceCode,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput.trim()
        };

        // Submit code to Judge0
        const submissionResponse = await axios.post(`${this.JUDGE0_API_URL}/submissions/?base64_encoded=false&wait=true`, submission, {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': this.API_KEY,
            'X-RapidAPI-Host': this.API_HOST
          }
        });

        const result: Judge0Response = submissionResponse.data;
        
        // Check if test case passed
        const passed = result.status.id === 3 && // Accepted status
                      result.stdout && 
                      result.stdout.trim() === testCase.expectedOutput.trim();
        
        if (passed) {
          obtainedMarks += testCase.marks || 1; // Default to 1 mark if not specified
        }
        
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout || '',
          passed: passed,
          status: result.status.description,
          marks: testCase.marks || 1
        });
      }
      
      return {
        success: true,
        totalMarks: totalMarks,
        obtainedMarks: obtainedMarks,
        percentage: totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0,
        testResults: results
      };
    } catch (error) {
      console.error('Error executing code with test cases:', error);
      throw new Error('Failed to execute code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
  
  /**
   * Execute code with a single input (for cases without predefined test cases)
   */
  async executeCode(sourceCode: string, language: string, input?: string): Promise<any> {
    try {
      const languageId = this.languageIds[language.toLowerCase()] || 63; // Default to JavaScript
      
      const submission: Judge0Submission = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: input || ''
      };

      // Submit code to Judge0
      const submissionResponse = await axios.post(`${this.JUDGE0_API_URL}/submissions/?base64_encoded=false&wait=true`, submission, {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.API_KEY,
          'X-RapidAPI-Host': this.API_HOST
        }
      });

      const result: Judge0Response = submissionResponse.data;
      
      return {
        success: result.status.id === 3, // Accepted status
        status: result.status.description,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compile_output: result.compile_output || '',
        message: result.message || ''
      };
    } catch (error) {
      console.error('Error executing code:', error);
      throw new Error('Failed to execute code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export default new Judge0Service();