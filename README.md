# SBA SOP Chat Frontend

A frontend interface for the SBA SOP Agent chat application.

## Local Testing Options

This repository includes several options for testing the chat functionality:

### 1. Mock Server Test
Test the frontend with a mock API server that simulates Lambda responses:

```bash
# Start the mock server
node mock_server.js

# Then open in your browser:
# http://localhost:3000/local_index.html
```

This test uses predefined responses but helps test the UI and response parsing.

### 2. Direct OpenAI Testing
Test OpenAI directly with your SBA documents database:

```bash
# Install dependencies
pip install openai pinecone-client python-dotenv

# Create a .env file with your API keys:
# OPENAI_API_KEY=your_openai_key
# PINECONE_API_KEY=your_pinecone_key
# PINECONE_ENVIRONMENT=your_environment
# PINECONE_INDEX=your_index_name

# Run the test script
python openai_local_test.py
```

This bypasses AWS Lambda and directly tests the document retrieval and OpenAI response generation.

### 3. Basic API Testing
Test the API communication without UI complexity:

```
http://localhost:3000/api_test.html
```

This provides a simple interface for testing API calls and viewing the raw responses.

## Deployment

1. Host the static files on a web server or GitHub Pages
2. Set the `API_URL` in script.js to point to your Lambda function's API Gateway URL
3. Ensure CORS is properly configured in your API Gateway

## Files

- `index.html` - Main chat interface
- `script.js` - Chat functionality and API communication
- `styles.css` - Styling for the chat interface
- `local_index.html` - Local testing version of the interface
- `mock_server.js` - Local mock server for testing
- `openai_local_test.py` - Direct OpenAI testing script
- `api_test.html` - Simple API testing page