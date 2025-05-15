import os
from dotenv import load_dotenv
from googleADKAgent.agent import root_agent

# Load environment variables from .env file
load_dotenv()

# Test the agent with a simple query
def test_agent():
    print("Testing agent with OpenRouter...")
    
    # Check if API key is available
    if not os.environ.get("OPENROUTER_API_KEY"):
        print("Error: OPENROUTER_API_KEY not found in environment variables")
        return
    
    # Test queries
    queries = [
        "What's the weather like in New York?",
        "What time is it in New York?",
        "Tell me about yourself"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        try:
            response = root_agent.run(query)
            print(f"Response: {response}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_agent()
