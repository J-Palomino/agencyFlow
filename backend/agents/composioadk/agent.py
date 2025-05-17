from google.adk.agents import Agent
from composio_openai import ComposioToolSet, Action
from dotenv import load_dotenv
from os import getenv
from typing import Optional, Dict, Any

# Load environment variables
load_dotenv()
COMPOSIO_API_KEY = getenv("COMPOSIO_API_KEY")

toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)
# integration_id = "ac_hDQiXrGMY0O0"
# integration = composio_toolset.get_integration(id="ac_hDQiXrGMY0O0")
# print(f"Integration: {integration}") # Integration object
# # Define specific wrapper functions for Composio tools



def gmail_fetch_emails(query: Optional[str] = None, max_results: int = 10) -> Dict[str, Any]:
    """Fetch emails from Gmail
    
    Args:
        query: Search query to filter emails
        max_results: Maximum number of emails to return
    Returns:
        dict: Status and email data
    """
    try:
        result = toolset.execute_action(
            action=Action.GMAIL_FETCH_EMAIL,
            params={
                "include_payload": True,
                "include_spam_trash": False,
                "query": query,
                "user_id": "me"
            },
            # entity_id="your-user-id" # Optional: Specify if not 'default'
        )
        if result.get("successful"):
            print("Successfully fetched emails!")
            return {
                "status": "success",
                "emails": result.get("data", []),
                "raw_response": result
            }
        else:
            print("Failed to fetch emails:", result.get("error"))
            return {
                "status": "error",
                "message": result.get("error"),
                "emails": []
            }
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "status": "error",
            "message": f"Error fetching emails: {str(e)}",
            "emails": []
        }

def gmail_mcp():
    try:
        integration = toolset.get_integration(id="ac_hDQiXrGMY0O0")
        print(f"Integration: {integration}")
    except Exception as e:
        print(f"An error occurred: {e}")


def fetch_emails():
    result = toolset.execute_action(  
        action=Action.GMAIL_FETCH_EMAILS,  
        params={  
            "userId": "me",  
            "maxResults": 10,  
            "labelIds": "INBOX"  
        },  
        entity_id="juan"  
    )  
      
    # Process the results  
    if result.get("successful"):  
        emails = result.get("data", {}).get("messages", [])  
        for email in emails:  
            print(f"From: {email.get('sender')}")  
            print(f"Subject: {email.get('subject')}")  
            print(f"Snippet: {email.get('snippet')}")  
            print("---")  
        return emails
    else:  
        print(f"Error: {result.get('error')}")
        return result.get("error")

# List of all tool wrapper functions
tools = [
    fetch_emails,
]


root_agent = Agent(
    name="composio_agent",
    model="gemini-2.0-flash",
    description="Agent to answer questions using github tools.",
    instruction="You are a helpful agent who can use github tools.",
    tools=tools,
)