import datetime
from zoneinfo import ZoneInfo
from google.adk.agents import Agent
from composio_openai import ComposioToolSet, Action

# Initialize toolset with your API key
composio_toolset = ComposioToolSet(api_key="3xilfxtnhfwpfa4g6h69pg")  # Replace with your API key

# Manually defined local tools
def get_weather(city: str) -> dict:
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": "The weather in New York is sunny with a temperature of 25°C (77°F).",
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }

def get_current_time(city: str) -> dict:
    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": f"Sorry, I don't have timezone information for {city}.",
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    return {"status": "success", "report": report}

# Get all active Composio connections
connections = composio_toolset.get_connected_accounts()
print("Connections:", connections)

# Map services to all relevant Composio Actions
service_action_map = {
    "gmail": [
        Action.GMAIL_FETCH_EMAILS,
    ]
}   

# Identify connected services and collect actions
active_services = {conn.appName.lower() for conn in connections if conn.status == "ACTIVE"}
selected_actions = [action for service in active_services for action in service_action_map.get(service, [])]

# Load Composio tools
composio_tools = composio_toolset.get_tools(actions=selected_actions)
print("Loaded Composio tools:", composio_tools)

# Add local tools
composio_tools.append(get_weather)
composio_tools.append(get_current_time)

# Define the AI agent
root_agent = Agent(
    name="Email Agent",
    model="gemini-2.0-flash",
    description="Agent to answer questions about the user's email and calendar.",
    instruction="You are a helpful agent who can assist with emails, calendars, and answer general questions."
)
