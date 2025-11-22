import judge0Service from './judge0.service';

// Test function to verify Judge0 API connection and language support
async function testJudge0Service() {
  console.log('Testing Judge0 Service...');
  
  try {
    // Test language ID mapping
    console.log('Testing language ID mapping:');
    console.log('JavaScript ID:', judge0Service.getLanguageId('javascript'));
    console.log('Java ID:', judge0Service.getLanguageId('java'));
    console.log('Python ID:', judge0Service.getLanguageId('python'));
    
    // Test API connection by getting available languages
    console.log('Testing API connection...');
    
    // Test submitting JavaScript code
    console.log('Testing JavaScript code execution...');
    const jsResult = await judge0Service.executeCode(
      'console.log("Hello from JavaScript!");', 
      'javascript', 
      ''
    );
    console.log('JavaScript result:', jsResult);
    
    // Test submitting Java code
    console.log('Testing Java code execution...');
    const javaResult = await judge0Service.executeCode(
      `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`, 
      'java', 
      ''
    );
    console.log('Java result:', javaResult);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testJudge0Service();