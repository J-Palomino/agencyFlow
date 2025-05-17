from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from composio_openai import ComposioToolSet, Action  
import os
from dotenv import load_dotenv
load_dotenv()
COMPOSIO_API_KEY = os.getenv("COMPOSIO_API_KEY")
# Initialize the toolset  
toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)  
provider = "openrouter"
model = "openai/gpt-4o-mini"
agent_name = "openrouter_agent"
agent_instruction = "You are a helpful assistant powered by GPT-4o."
agent_description = "Agent to help user fetch emails"

tools = []

def gmail_fetch_emails():
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
    else:  
        print(f"Error: {result.get('error')}")

root_agent = LlmAgent(
    model=LiteLlm(model=f"{provider}/{model}", llm_provider=provider), # LiteLLM model string format
    name=agent_name,
    instruction=agent_instruction,
    description=agent_description,
    tools=tools,
)
