# Absolute minimal Lambda function for testing
# Copy this directly to your AWS Lambda function for testing

import json

def lambda_handler(event, context):
    """
    Minimal lambda handler with fixed response for testing.
    No actual question processing, just returns a fixed response.
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Fixed response with no parsing logic
    response = {
        "answer": "This is a fixed response from the minimal lambda function to test the frontend parsing.",
        "sources": [
            {
                "citation": "Test citation",
                "source": "Test document"
            }
        ]
    }
    
    # Return with proper CORS headers
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": json.dumps(response)
    }