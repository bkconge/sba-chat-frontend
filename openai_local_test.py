#!/usr/bin/env python3
"""
Direct OpenAI API test for SBA SOP Agent
This script bypasses Lambda and directly:
1. Queries your vector database for relevant SBA document chunks
2. Prompts OpenAI's 4o model with proper context
3. Formats the response with citations

Setup:
1. Install required packages: pip install openai pinecone python-dotenv
2. Create a .env file with your API keys
3. Run this script directly

The script will ask for a question and generate a response with proper citations.
"""

import os
import json
import time
from typing import List, Dict, Any, Optional
import re
from dotenv import load_dotenv

# Try to import OpenAI and Pinecone, handle if not installed
try:
    from openai import OpenAI
except ImportError:
    print("OpenAI package not installed. Install with: pip install openai")
    exit(1)

# Try different ways to import Pinecone based on version
try:
    try:
        # Try newer Pinecone client first
        from pinecone import Pinecone
        PINECONE_VERSION = "new"
        print("Using newer Pinecone client")
    except ImportError:
        # Fall back to older client
        import pinecone
        PINECONE_VERSION = "old"
        print("Using older Pinecone client")
except ImportError:
    print("Pinecone package not installed. Install with: pip install pinecone")
    exit(1)

# Load environment variables from .env file
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "sba-sop") 

# Check if API keys are set
if not OPENAI_API_KEY:
    OPENAI_API_KEY = input("Enter your OpenAI API key: ")
    
if not PINECONE_API_KEY:
    PINECONE_API_KEY = input("Enter your Pinecone API key: ")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Initialize Pinecone based on version
if PINECONE_VERSION == "new":
    # New client
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # List available indexes
    try:
        indexes = pc.list_indexes()
        index_names = [idx.name for idx in indexes]
        print(f"Available indexes: {index_names}")
        
        # Connect to index
        if PINECONE_INDEX not in index_names:
            print(f"Index {PINECONE_INDEX} does not exist.")
            if index_names:
                PINECONE_INDEX = index_names[0]
                print(f"Using index: {PINECONE_INDEX}")
            else:
                print("No indexes available. Please create an index in Pinecone first.")
                exit(1)
                
        index = pc.Index(PINECONE_INDEX)
    except Exception as e:
        print(f"Error connecting to Pinecone (new client): {e}")
        exit(1)
else:
    # Old client
    try:
        pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENVIRONMENT)
        
        # List available indexes
        index_names = pinecone.list_indexes()
        print(f"Available indexes: {index_names}")
        
        # Connect to index
        if PINECONE_INDEX not in index_names:
            print(f"Index {PINECONE_INDEX} does not exist.")
            if index_names:
                PINECONE_INDEX = index_names[0]
                print(f"Using index: {PINECONE_INDEX}")
            else:
                print("No indexes available. Please create an index in Pinecone first.")
                exit(1)
                
        index = pinecone.Index(PINECONE_INDEX)
    except Exception as e:
        print(f"Error connecting to Pinecone (old client): {e}")
        exit(1)

def create_embedding(text: str) -> List[float]:
    """Create an embedding for the given text using OpenAI's embeddings API"""
    try:
        response = client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error creating embedding: {e}")
        return []

def query_pinecone(question: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Query Pinecone for relevant documents based on the question embedding"""
    print(f"Generating embedding for query: '{question}'")
    embedding = create_embedding(question)
    if not embedding:
        print("Failed to create embedding")
        return []
    
    print(f"Embedding generated successfully (length: {len(embedding)})")
    
    try:
        print(f"Querying Pinecone index '{PINECONE_INDEX}' with top_k={top_k}")
        
        # Try a simple broader query first
        keywords = ["sba", "loan", "eligibility", "requirements"]
        broader_query = "SBA loan eligibility requirements citizenship"
        print(f"First trying a broader query: '{broader_query}'")
        
        # Query based on client version
        if PINECONE_VERSION == "new":
            try:
                # Get index stats
                stats = index.describe_index_stats()
                print(f"Index stats: {stats}")
                print(f"Total vectors in index: {stats.get('total_vector_count', 'unknown')}")
            except Exception as e:
                print(f"Couldn't get index stats: {e}")
                
            results = index.query(
                vector=embedding,
                top_k=top_k,
                include_metadata=True
            )
            # Extract matches from response
            matches = results.get('matches', [])
            
            # If no matches, try the broader query
            if not matches:
                print("No matches found, trying broader query...")
                broader_embedding = create_embedding(broader_query)
                broader_results = index.query(
                    vector=broader_embedding,
                    top_k=top_k,
                    include_metadata=True
                )
                matches = broader_results.get('matches', [])
        else:
            # Old client
            try:
                # Get index stats
                stats = index.describe_index_stats()
                print(f"Index stats: {stats}")
            except Exception as e:
                print(f"Couldn't get index stats: {e}")
                
            results = index.query(
                vector=embedding,
                top_k=top_k,
                include_metadata=True
            )
            matches = results.matches if hasattr(results, 'matches') else []
            
            # If no matches, try the broader query
            if not matches:
                print("No matches found, trying broader query...")
                broader_embedding = create_embedding(broader_query)
                broader_results = index.query(
                    vector=broader_embedding,
                    top_k=top_k,
                    include_metadata=True
                )
                matches = broader_results.matches if hasattr(broader_results, 'matches') else []
        
        print(f"Retrieved {len(matches)} relevant documents")
        
        # Debug: Print match scores and metadata
        if matches:
            print("\nTop matches:")
            for i, match in enumerate(matches[:3]):
                score = match.get('score', 0) if isinstance(match, dict) else getattr(match, 'score', 0)
                metadata = match.get('metadata', {}) if isinstance(match, dict) else getattr(match, 'metadata', {})
                print(f"Match {i+1} (score: {score}): {metadata.get('source', 'unknown')} - {metadata.get('citation', 'unknown')}")
                
        return matches
    except Exception as e:
        print(f"Error querying Pinecone: {e}")
        print(f"Exception type: {type(e)}")
        import traceback
        traceback.print_exc()
        return []

def format_context(matches: List[Dict[str, Any]]) -> tuple:
    """Format the retrieved documents into context for the prompt"""
    contexts = []
    sources = []
    
    for match in matches:
        if 'metadata' in match and match['metadata']:
            metadata = match['metadata']
            
            # Extract the document content
            text = metadata.get('text', '')
            
            # Extract source information
            source = metadata.get('source', '')
            citation = metadata.get('citation', '')
            
            if text:
                # Add the document to the context
                context_item = f"\nDocument from {source}, {citation}:\n{text}\n"
                contexts.append(context_item)
                
                # Add source information
                if source and citation:
                    sources.append({
                        "source": source,
                        "citation": citation
                    })
    
    return "\n".join(contexts), sources

def extract_references(answer: str) -> tuple:
    """Extract references from the answer text and clean it up"""
    # Simple pattern matching - adjust based on your actual response format
    references_pattern = r'(REFERENCES|SOURCES):\s*(.+)$'
    match = re.search(references_pattern, answer, re.DOTALL | re.IGNORECASE)
    
    if match:
        answer_text = answer[:match.start()].strip()
        references_text = match.group(2).strip()
        return answer_text, references_text
    
    return answer, ""

def generate_response(question: str, context: str, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate a response using OpenAI's chat completion API with the provided context"""
    system_prompt = """You are an expert on SBA Standard Operating Procedures (SOPs) trained to provide accurate information with proper citations.
    
When answering questions:
1. Use ONLY the information provided in the context
2. If the context doesn't contain the information needed, say "I don't have specific information about that in my database"
3. Format your citations precisely as "Chapter X.Y.Z" or "Section X.Y.Z" when referring to specific parts of the SOP
4. Be concise and direct in your answers
5. ALWAYS include citations for your information

IMPORTANT: Never mention that you're using "context" or "documents" - simply provide the information as if you're an SBA expert.
"""

    user_prompt = f"""Question: {question}

Context information:
{context}

Please answer the question based strictly on the information provided above, with proper citations to the SOP sections.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0
        )
        
        answer = response.choices[0].message.content
        
        # Clean up the answer and extract any references
        clean_answer, _ = extract_references(answer)
        
        return {
            "answer": clean_answer,
            "sources": sources
        }
    except Exception as e:
        print(f"Error generating response: {e}")
        return {
            "answer": "Sorry, I encountered an error generating a response.",
            "sources": []
        }

def main():
    """Main function to run the script interactively"""
    print("\n=== SBA SOP Agent Direct OpenAI Test ===")
    print("This script bypasses Lambda and calls OpenAI directly with your SBA documents.")
    print("Type 'exit' to quit.\n")
    
    while True:
        question = input("\nEnter your question about SBA SOPs: ")
        if question.lower() in ('exit', 'quit'):
            break
            
        start_time = time.time()
        
        print("\nRetrieving relevant documents...")
        matches = query_pinecone(question, top_k=5)
        
        if not matches:
            print("No relevant documents found. Using fallback mode...")
            # Fallback - directly query OpenAI without context
            fallback_response = generate_fallback_response(question)
            
            end_time = time.time()
            
            # Print the fallback response
            print("\n=== Fallback Response (no documents) ===")
            print(fallback_response["answer"])
            
            print(f"\nFallback response generated in {end_time - start_time:.2f} seconds")
            
            # Optionally write to file
            with open("last_response.json", "w") as f:
                json.dump(fallback_response, f, indent=2)
            print("Response saved to last_response.json")
            continue
            
        print(f"Found {len(matches)} relevant documents.")
        
        # Format context from retrieved documents
        context, sources = format_context(matches)
        
        print("\nGenerating response...")
        response = generate_response(question, context, sources)
        
        end_time = time.time()
        
        # Print the response
        print("\n=== Response ===")
        print(response["answer"])
        
        print("\n=== Sources ===")
        for source in response["sources"]:
            print(f"- {source['citation']} in {source['source']}")
            
        print(f"\nResponse generated in {end_time - start_time:.2f} seconds")
        
        # Optionally write to file
        with open("last_response.json", "w") as f:
            json.dump(response, f, indent=2)
        print("Response saved to last_response.json")

def generate_fallback_response(question: str) -> Dict[str, Any]:
    """Generate a response without context when no documents are found"""
    system_prompt = """You are an expert on SBA Standard Operating Procedures (SOPs).
    
When answering questions:
1. Provide general information about SBA policies
2. If you don't have specific information, clearly state that
3. Be truthful and direct in your answers
4. Focus on what would likely be in the SBA SOPs

IMPORTANT: Since specific SBA SOP documents aren't available for this question, 
explain that you're providing general information that may not reflect the
latest SBA policies."""

    user_prompt = f"""Question: {question}

Please provide your best answer based on general knowledge about SBA policies.
Make it clear that this is general information and may not reflect the most 
current SBA Standard Operating Procedures."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0
        )
        
        answer = response.choices[0].message.content
        
        return {
            "answer": answer,
            "sources": [{"citation": "No specific SOP reference available", "source": "General knowledge"}]
        }
    except Exception as e:
        print(f"Error generating fallback response: {e}")
        return {
            "answer": "I'm unable to provide information on this topic due to an error. Please try again with a different question.",
            "sources": []
        }

if __name__ == "__main__":
    main()