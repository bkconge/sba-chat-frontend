// This is a test version of script.js that uses httpbin.org to test response handling
document.addEventListener('DOMContentLoaded', function() {
    // Copy of your existing script.js with a modified API_URL
    
    // ... [Beginning of your script.js file] ...
    
    // API configuration - using httpbin.org for testing
    const API_URL = 'https://httpbin.org/post';  // This service will echo back whatever you send
    const API_KEY = '';
    
    // ... [Rest of your script.js file] ...
    
    // Modified sendMessageToAPI function for testing
    async function sendMessageToAPI(message) {
        try {
            // Create the request body
            const requestBody = {
                question: message,
                top_k: 5
            };
            
            // Log the exact request being sent
            console.log('Sending API request:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            // Debug: Log the exact response format from httpbin
            console.log('httpbin Response:', JSON.stringify(data, null, 2));
            
            // For httpbin.org, create a simulated Lambda response
            const simulatedResponse = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    answer: `This is a test response for your question: "${message}"`,
                    sources: [
                        { citation: "Test Citation", source: "Test Source" }
                    ]
                })
            };
            
            console.log('Simulated Lambda Response:', JSON.stringify(simulatedResponse, null, 2));
            
            // Try to parse this simulated response
            let answer = '';
            let sources = [];
            
            try {
                // Parse the nested body JSON string
                const bodyData = JSON.parse(simulatedResponse.body);
                console.log('Parsed body data:', bodyData);
                
                if (bodyData.answer) {
                    answer = bodyData.answer;
                    sources = bodyData.sources || [];
                    console.log('Found answer in parsed body');
                }
            } catch (e) {
                console.error('Error parsing body:', e);
            }
            
            // Return in our standard format
            return {
                answer: answer || "Test response - parsing failed",
                sources: sources
            };
        } catch (error) {
            console.error('API request error:', error);
            // Return mock data for demo
            return mockAPIResponse(message);
        }
    }
    
    // ... [Remaining of your script.js file] ...
});