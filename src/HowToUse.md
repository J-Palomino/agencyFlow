# How to Use the Organization Chart Tool

Welcome to the Organization Chart Tool! This guide will help you quickly get started and make the most of the advanced agentic and A2A (agent-to-agent) features.

---

## 1. **Adding and Configuring Agents**
- Click the "+" button or use the UI to add a new agent node.
- Click on an agent node to select it, then click **Edit** in the "LLM Config" section to configure:
  - **Agent Type:**
    - **Backend-managed:** The agent runs in your backend (default, recommended for most users).
    - **Remote (A2A endpoint):** The agent is an external ADK/A2A-compatible endpoint. Enter the remote URL in the LLM URL field.
  - **LLM URL:** For remote agents, enter the endpoint URL. Leave blank for backend agents.
  - **System Prompt/User Prompt:** Customize agent instructions.
  - Click **Save** to apply changes.

## 2. **Connecting Agents**
- Drag from the bottom handle of one agent node to the top handle of another to create a connection.
- Choose the relationship type:
  - **Direct Report, Indirect, Advisory, etc.**
  - **Collaboration:** Special type for A2A/remote agent-to-agent communication. If the target agent has an LLM URL, messages will be sent via A2A protocol.

## 3. **Sending Messages**
- Select an agent node and use the "Send Message" form at the bottom of the details panel.
- Choose a recipient agent and type your message.
- Click **Send**. The message will:
  - Go to the backend agent by default.
  - Go to the remote agent via A2A if the edge is a Collaboration and the target agent has an LLM URL.
- Conversation history is tracked per agent.

## 4. **Telemetry & Session Logging**
- All messages and actions are recorded for each session.
- Telemetry can be accessed via the backend for auditing, debugging, or replay.

## 5. **Best Practices**
- Use backend-managed agents for most flows unless you need to integrate with external A2A/ADK endpoints.
- Use Collaboration edges for agent-to-agent protocols.
- Keep your agent prompts and secrets up to date for best results.

## 6. **Advanced**
- You can fetch and review telemetry for a session by calling the backend `/telemetry/session/{sessionId}` endpoint.
- Remote agents must implement a compatible A2A/ADK protocol endpoint.

---

For more help, see the README or contact your system administrator.


"""
Composio + OpenAI Agent Integration
Reusable function for tool-augmented LLM calls via OpenRouter/OpenAI and Composio.
Place your .env with OPENROUTER_API_KEY and COMPOSIO_API_KEY in the same directory or project root.
"""
import sys
import traceback
from dotenv import load_dotenv
from composio_openai import ComposioToolSet, Action
from openai import OpenAI
from os import getenv

# === 1. Load Environment Variables ===
load_dotenv()
OPENROUTER_API_KEY = getenv("OPENROUTER_API_KEY")
COMPOSIO_API_KEY = getenv("COMPOSIO_API_KEY")
BASE_URL = getenv("BASE_URL", "https://openrouter.ai/api/v1")
HTTP_REFERER = getenv("HTTP_REFERER")
X_TITLE = getenv("X_TITLE")

if not OPENROUTER_API_KEY:
    raise RuntimeError("[ENV] OPENROUTER_API_KEY not set in environment!")

# === 2. Initialize OpenAI Client ===
client = OpenAI(
    base_url=BASE_URL,
    api_key=OPENROUTER_API_KEY,
)

def run_composio_openai_agent(user_message, actions, model="openai/gpt-4o-mini"):
    """
    Run a tool-augmented LLM call using OpenAI (OpenRouter) and Composio tools.
    Args:
        user_message (str): The user's prompt for the LLM.
        actions (list): List of composio_openai.Action enums to enable as tools.
        model (str): OpenAI model string (default: "openai/gpt-4o-mini").
    Returns:
        dict: Tool call results or LLM response.
    """
    # === 3. Initialize Composio ToolSet ===
    try:
        toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)
    except Exception:
        print("[INIT] Failed to initialize ComposioToolSet:")
        traceback.print_exc()
        return None

    # === 4. Retrieve OpenAI-Compatible Tools ===
    try:
        tools = toolset.get_tools(actions=actions)
    except Exception:
        print("[TOOLS] Failed to get Composio tools:")
        traceback.print_exc()
        return None

    # === 5. Make a Chat Completion Call ===
    try:
        messages = [
            {"role": "user", "content": user_message}
        ]
        extra_headers = {}
        if HTTP_REFERER:
            extra_headers["HTTP-Referer"] = HTTP_REFERER
        if X_TITLE:
            extra_headers["X-Title"] = X_TITLE
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            extra_headers=extra_headers if extra_headers else None,
        )
    except Exception:
        print("[OPENAI] OpenAI chat completion failed:")
        traceback.print_exc()
        return None

    # === 6. Handle Tool Calls ===
    try:
        tool_call_results = toolset.handle_tool_calls(response)
        return tool_call_results
    except Exception:
        print("[TOOLS] Failed to handle tool calls:")
        traceback.print_exc()
        return None


integration_id = "ac_hDQiXrGMY0O0"
integration = toolset.get_integration(id=integration_id)