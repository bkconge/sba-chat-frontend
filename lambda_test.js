// Simple Lambda function test for SBA SOP Agent

// This is the expected Lambda function handler structure
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Parse the incoming request body
    let requestBody;
    try {
        if (typeof event.body === 'string') {
            requestBody = JSON.parse(event.body);
        } else if (typeof event.body === 'object') {
            requestBody = event.body;
        } else {
            requestBody = {};
        }
    } catch (error) {
        console.error('Error parsing request body:', error);
        requestBody = {};
    }
    
    // Extract the question from the request
    const question = requestBody.question || 'No question provided';
    console.log('Question:', question);
    
    // Mock response with SBA loan information
    const response = {
        answer: `Here's information about SBA loans related to your question: "${question}"\n\nSBA loans require businesses to be for-profit, operating in the US, have reasonable owner equity, and have utilized alternative financial resources first.`,
        sources: [
            {
                citation: "Chapter 2.A.1",
                source: "SOP 50 10 6"
            },
            {
                citation: "Section 3.B.4",
                source: "SOP 50 10 6"
            }
        ]
    };
    
    // Return the response with proper CORS headers
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',  // Allow any origin
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify(response)
    };
};

// Test the handler function with a mock event
const mockEvent = {
    body: JSON.stringify({
        question: "What are the eligibility requirements for SBA loans?",
        top_k: 5
    })
};

// Self-executing async function to test
(async () => {
    try {
        console.log('--- Testing Lambda Handler ---');
        const result = await exports.handler(mockEvent);
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Also parse the body to show the actual response data
        console.log('Response body (parsed):');
        console.log(JSON.parse(result.body));
    } catch (error) {
        console.error('Test error:', error);
    }
})();