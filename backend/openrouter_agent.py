import os
import requests
import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List, Union

# Load environment variables
load_dotenv()

# Get API key from environment
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY not found in environment variables")

class OpenRouterAgent:
    """
    A simple agent implementation that uses OpenRouter API.
    Compatible with the ADK agent interface expected by the main application.
    """
    def __init__(
        self,
        name: str,
        model: str = "anthropic/claude-3-opus",
        description: str = None,
        tools: List = None,
        prompts: Dict[str, str] = None,
        sub_agents: List = None,
        api_key: str = None
    ):
        self.name = name
        self.model = model
        self.description = description or "A helpful assistant."
        self.tools = tools or []
        self.prompts = prompts or {"system": "You are a helpful assistant.", "user": ""}
        self.sub_agents = sub_agents or []
        self.api_key = api_key or OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        
        # Validate API key
        if not self.api_key:
            raise ValueError("OpenRouter API key is required")
    
    def run(self, user_input: str) -> str:
        """Process user input and return a response."""
        # Check if we should use a tool based on simple keyword matching
        for tool in self.tools:
            if callable(tool):
                # Handle function tools
                tool_name = tool.__name__
                if tool_name.lower() in user_input.lower():
                    try:
                        # Extract city from input (simple approach)
                        city = "New York"  # Default
                        result = tool(city)
                        if result.get("status") == "success":
                            return result.get("report", "Tool executed successfully.")
                        else:
                            return result.get("error_message", "Tool execution failed.")
                    except Exception as e:
                        return f"Error executing tool {tool_name}: {str(e)}"
            elif isinstance(tool, str):
                # Handle string tool names (for demo purposes)
                if tool.lower() in user_input.lower():
                    return f"Using tool: {tool} (simulated response)"
            elif isinstance(tool, dict) and tool.get("name"):
                # Handle tool objects with name property
                if tool["name"].lower() in user_input.lower():
                    return f"Using tool: {tool['name']} (simulated response)"
        
        # If no tool matches, use the LLM
        return self._call_openrouter(user_input)
    
    def _call_openrouter(self, user_input: str) -> str:
        """Call OpenRouter API to get a response."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://agencyflow.app"  # Replace with your actual domain
        }
        
        # Prepare messages
        messages = []
        
        # Add system prompt if available
        if self.prompts and self.prompts.get("system"):
            system_content = self.prompts["system"]
            if self.description:
                system_content += f"\n\n{self.description}"
            messages.append({"role": "system", "content": system_content})
        
        # Add user prompt prefix if available
        if self.prompts and self.prompts.get("user"):
            user_content = f"{self.prompts['user']}\n\n{user_input}"
            messages.append({"role": "user", "content": user_content})
        else:
            messages.append({"role": "user", "content": user_input})
        
        data = {
            "model": self.model,
            "messages": messages
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions", 
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return f"Error calling OpenRouter: {str(e)}"

# Example tool functions
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

# Factory function to create an OpenRouter agent
def create_openrouter_agent(
    name: str,
    model: str = "anthropic/claude-3-opus",
    description: str = None,
    tools: List = None,
    prompts: Dict[str, str] = None,
    sub_agents: List = None
) -> OpenRouterAgent:
    """
    Factory function to create an OpenRouter agent with the specified parameters.
    This function can be used by the main application to create agents.
    """
    # Default tools if none provided
    if tools is None:
        tools = [get_weather, get_current_time]
    
    return OpenRouterAgent(
        name=name,
        model=model,
        description=description,
        tools=tools,
        prompts=prompts,
        sub_agents=sub_agents
    )
