// Simple API test to verify Judge0 connection
async function testJudge0API() {
  const API_KEY = '71f78ee725msh40430879752b86fp108e2bjsn4c0260b84f17';
  const API_HOST = 'judge0-ce.p.rapidapi.com';
  const API_URL = `https://${API_HOST}`;
  
  console.log('Testing Judge0 API directly...');
  
  try {
    // Test getting languages
    console.log('Getting languages...');
    const langResponse = await fetch(`${API_URL}/languages`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      }
    });
    
    console.log('Languages response status:', langResponse.status);
    const languages = await langResponse.json();
    console.log('Languages:', languages);
    
    // Test submitting JavaScript code
    console.log('Submitting JavaScript code...');
    const submitResponse = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      body: JSON.stringify({
        source_code: 'console.log("Hello from direct API test!");',
        language_id: 63, // JavaScript
        stdin: ''
      })
    });
    
    console.log('Submit response status:', submitResponse.status);
    const submitData = await submitResponse.json();
    console.log('Submit response:', submitData);
    
    if (submitData.token) {
      console.log('Getting submission result...');
      // Wait a bit before getting result
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resultResponse = await fetch(`${API_URL}/submissions/${submitData.token}?base64_encoded=false&fields=*`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST
        }
      });
      
      console.log('Result response status:', resultResponse.status);
      const resultData = await resultResponse.json();
      console.log('Result response:', resultData);
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testJudge0API();