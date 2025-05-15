import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base URL for your FastAPI backend
BASE_URL = "http://localhost:8000"

def test_create_openrouter_agent():
    """Test creating an OpenRouter agent through the API"""
    print("Testing OpenRouter agent creation...")
    
    # Agent configuration
    agent_config = {
        "id": "test-openrouter-agent",
        "name": "Test OpenRouter Agent",
        "model": "anthropic/claude-3-opus",
        "description": "A test agent using OpenRouter",
        "tools": ["weather", "time", {"name": "calculator"}],
        "prompts": {
            "system": "You are a helpful assistant that can answer questions about weather and time.",
            "user": "Hello! I'm looking for some help today."
        }
    }
    
    # Create the agent
    response = requests.post(
        f"{BASE_URL}/openrouter/agents/",
        json=agent_config
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200 and response.json().get("status") == "ok":
        agent_id = agent_config["id"]
        print(f"\nAgent created successfully with ID: {agent_id}")
        
        # Now test sending a message to the agent
        test_send_message(agent_id)
    else:
        print("Failed to create agent")

def test_send_message(agent_id):
    """Test sending a message to the created agent"""
    print("\nTesting sending a message to the agent...")
    
    # Prepare message request
    message_request = {
        "fromId": "test-user",
        "message": "What's the weather like in New York?",
        "sessionId": "test-session"
    }
    
    # Send the message
    response = requests.post(
        f"{BASE_URL}/adk/agent",
        json={
            "fromId": agent_id,
            "message": message_request["message"],
            "sessionId": message_request["sessionId"]
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    test_create_openrouter_agent()
