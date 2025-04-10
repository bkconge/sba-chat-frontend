# Simple AWS Lambda function for SBA SOP Agent
# This is a minimal implementation that can be directly copied to the AWS Lambda console

import json

def lambda_handler(event, context):
    """
    Simple Lambda handler that returns a formatted response.
    Copy this code directly into your AWS Lambda function.
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Get the request body
    try:
        # API Gateway sends the body as a string that needs to be parsed
        if isinstance(event.get('body'), str):
            body = json.loads(event.get('body', '{}'))
        else:
            body = event.get('body', {})
    except Exception as e:
        print(f"Error parsing request body: {str(e)}")
        body = {}
    
    # Get the question from the request
    question = body.get('question', 'No question provided')
    print(f"Question: {question}")
    
    # Mock response with SBA loan information
    response = {
        "answer": f"Here's information about SBA loans related to your question: '{question}'\n\nSBA loans require businesses to be for-profit, operating in the US, have reasonable owner equity, and have utilized alternative financial resources first.",
        "sources": [
            {
                "citation": "Chapter 2.A.1",
                "source": "SOP 50 10 6"
            },
            {
                "citation": "Section 3.B.4",
                "source": "SOP 50 10 6"
            }
        ]
    }
    
    # Return the response with proper CORS headers
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # For development - restrict this in production
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": json.dumps(response)
    }

# For local testing
if __name__ == "__main__":
    # Test event mimicking API Gateway
    test_event = {
        "body": json.dumps({
            "question": "What are the eligibility requirements for SBA loans?",
            "top_k": 5
        })
    }
    
    # Call the handler and print the response
    result = lambda_handler(test_event, None)
    print("\nLambda response:")
    print(json.dumps(result, indent=2))
    
    # Also print the parsed body
    print("\nParsed response body:")
    print(json.dumps(json.loads(result["body"]), indent=2))