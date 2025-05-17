from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm
from composio_openai import ComposioToolSet, App



composio_toolset = ComposioToolSet(entity_id="juan")

tools = composio_toolset.get_tools(apps=[App.GMAIL])

def composio_wrapper(response: str) -> dict:
    """Use the tools from the MCP server to execute the response from the LLM.
 fetch_emails from google
    Args:
        response (str): The response from the LLM.

    Returns:
        dict: status and result or error msg.
    """
    result = composio_toolset.handle_tool_calls(response=response)
    return result

root_agent = LlmAgent(
    model=LiteLlm(model="openai/gpt-4o"), # LiteLLM model string format
    name="openai_agent",
    instruction="You are a helpful assistant using GMAIL calls to help the user",
    description=(
        "Agent to answer questions about the time and weather in a city."
    ),
    tools=[composio_wrapper],
)