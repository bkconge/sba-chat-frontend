# Fixed AWS Lambda function for SBA SOP Agent
# This version properly extracts the question from the request body

import json
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    Lambda handler with improved request parsing.
    Copy this code directly into your AWS Lambda function.
    """
    # Log the entire event for debugging
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Initialize question with a default value
    question = "No question provided"
    
    # Get the request body with detailed logging
    try:
        # Check if body exists and parse it if it's a string
        if 'body' in event:
            logger.info(f"Body type: {type(event['body'])}")
            
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
                logger.info(f"Parsed body: {json.dumps(body)}")
            else:
                body = event['body']
                logger.info(f"Body object: {json.dumps(body)}")
                
            # Extract the question
            if 'question' in body:
                question = body['question']
                logger.info(f"Extracted question: {question}")
            else:
                logger.warning("No 'question' field found in body")
                # Log all keys in body for debugging
                logger.warning(f"Body keys: {list(body.keys())}")
        else:
            # If no body, try to find question directly in the event
            logger.warning("No 'body' field in event")
            if 'question' in event:
                question = event['question']
                logger.info(f"Extracted question directly from event: {question}")
            else:
                # Log all top-level keys in event for debugging
                logger.warning(f"Event keys: {list(event.keys())}")
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
    
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": json.dumps(response)
    }