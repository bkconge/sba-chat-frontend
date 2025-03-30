// Mock server for SBA Chat testing - simulates the Lambda function response
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Mock database of SBA information
const sbaData = [
  {
    question: "eligibility requirements",
    answer: "SBA loan eligibility generally requires your business to be for-profit, operating in the US, have invested equity, and have exhausted other financing options. The specific requirements may vary depending on the loan program you're applying for.",
    sources: [
      { citation: "Chapter 2.A on page 104", source: "SOP 50 10 6" },
      { citation: "Chapter 3.B.2 on page 127", source: "SOP 50 10 6" }
    ]
  },
  {
    question: "7(a) loan",
    answer: "The SBA 7(a) loan program is the SBA's primary program for providing financial assistance to small businesses. The maximum loan amount is $5 million with terms up to 25 years for real estate and 10 years for equipment and working capital.",
    sources: [
      { citation: "Section A.1 on page 8", source: "SOP 50 10 6" }
    ]
  },
  {
    question: "504 loan",
    answer: "For SBA 504 loans, the typical structure is 10% down from the borrower, 40% from the CDC/SBA, and 50% from a conventional lender. The maximum SBA debenture is generally $5 million but can be up to $5.5 million for small manufacturing businesses or energy projects.",
    sources: [
      { citation: "Chapter 4.C on page 230", source: "SOP 50 10 6" },
      { citation: "Section D.2.a on page 245", source: "SOP 50 10 6" }
    ]
  },
  {
    question: "interest rates",
    answer: "SBA 7(a) loan interest rates can be fixed or variable, and are typically based on the prime rate plus a markup. The maximum allowable interest rates depend on the loan amount and term length. The SBA sets these limits to keep loans affordable for small businesses.",
    sources: [
      { citation: "Section 5.C.1 on page 312", source: "SOP 50 10 6" }
    ]
  },
  {
    question: "collateral requirements",
    answer: "SBA loans typically require collateral to secure the loan. For 7(a) loans over $350,000, the SBA requires the lender to collateralize the loan to the maximum extent possible, up to the loan amount. For loans under $350,000, lenders may follow their own collateral policies.",
    sources: [
      { citation: "Chapter 5.B on page 287", source: "SOP 50 10 6" }
    ]
  }
];

// Function to find the best matching response
function findBestResponse(question) {
  if (!question) return null;
  
  // Convert to lowercase for case-insensitive matching
  const lowerQuestion = question.toLowerCase();
  
  // Find the first item that has keywords matching the question
  for (const item of sbaData) {
    if (lowerQuestion.includes(item.question)) {
      return item;
    }
  }
  
  // Default response if no match found
  return {
    answer: `I don't have specific information about "${question}" in my database. Generally, SBA loans are available to small businesses that meet eligibility criteria including size standards, operating in the US, and demonstrating a need for credit.`,
    sources: [
      { citation: "General Information", source: "SOP 50 10 6" }
    ]
  };
}

// HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle API endpoint - simulate Lambda function
  if (pathname === '/api/sba-sop-agent' || pathname === '/api/chat') {
    if (req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          // Parse the request body
          const requestData = JSON.parse(body);
          const question = requestData.question || '';
          
          console.log(`Received question: "${question}"`);
          
          // Find the best matching response
          const responseData = findBestResponse(question);
          
          // Format the response like Lambda Proxy Integration
          const lambdaResponse = {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,Authorization',
              'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify(responseData)
          };
          
          // Send the response
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(lambdaResponse));
          
        } catch (error) {
          console.error('Error processing request:', error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request' }));
        }
      });
      
      return;
    } else {
      // Method not allowed
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }
  }
  
  // Serve static files
  let filePath = '.' + pathname;
  if (pathname === '/') {
    filePath = './local_test.html';
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'text/plain';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found - try to serve local_test.html
        fs.readFile('./local_test.html', (error, content) => {
          if (error) {
            // Something went really wrong
            res.writeHead(500);
            res.end('Error loading the page');
            console.error(error);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        console.error(err);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Mock SBA Server running at http://localhost:${PORT}/`);
  console.log(`Test the chat interface at http://localhost:${PORT}/`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/sba-sop-agent`);
  console.log(`Press Ctrl+C to stop the server`);
});