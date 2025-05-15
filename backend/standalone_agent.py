import os
import requests
import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY not found in environment variables")

# Tool functions (copied from your agent.py)
def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city."""
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees"
                " Celsius (77 degrees Fahrenheit)."
            ),
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I don't have timezone information for {city}."
            ),
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = (
        f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    )
    return {"status": "success", "report": report}

# Simple OpenRouter client
class OpenRouterAgent:
    def __init__(self, name, model="anthropic/claude-3-opus", system_prompt=None):
        self.name = name
        self.model = model
        self.system_prompt = system_prompt or "You are a helpful AI assistant."
        self.tools = [get_weather, get_current_time]
        self.base_url = "https://openrouter.ai/api/v1"
    
    def run(self, user_input):
        """Process user input and return a response."""
        # Check if we should use a tool based on simple keyword matching
        if "weather" in user_input.lower():
            city = "New York"  # For simplicity, always use New York
            result = get_weather(city)
            if result["status"] == "success":
                return result["report"]
            else:
                return result["error_message"]
        
        if "time" in user_input.lower():
            city = "New York"  # For simplicity, always use New York
            result = get_current_time(city)
            if result["status"] == "success":
                return result["report"]
            else:
                return result["error_message"]
        
        # If no tool matches, use the LLM
        return self._call_openrouter(user_input)
    
    def _call_openrouter(self, user_input):
        """Call OpenRouter API to get a response."""
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        data = {
            "model": self.model,
            "messages": messages
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=headers,
                json=data
            )
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return f"Error calling OpenRouter: {str(e)}"

# Create the agent
agent = OpenRouterAgent(
    name="weather_time_agent",
    model="anthropic/claude-3-opus",
    system_prompt="You are a helpful agent who can answer user questions about the time and weather in a city."
)

# Test function
def test_agent():
    print("Testing agent with OpenRouter...")
    
    # Test queries
    queries = [
        "What's the weather like in New York?",
        "What time is it in New York?",
        "Tell me about yourself"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        try:
            response = agent.run(query)
            print(f"Response: {response}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_agent()
