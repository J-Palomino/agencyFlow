import sys
import traceback
from dotenv import load_dotenv
from composio_openai import ComposioToolSet, Action
from openai import OpenAI
from os import getenv

print("\n========== Composio + OpenAI Integration Example ==========")

# === 1. Load Environment Variables ===
# Loads .env file and fetches all required API keys and configuration.
print("[ENV] Loading environment variables from .env ...")
load_dotenv()
OPENROUTER_API_KEY = getenv("OPENROUTER_API_KEY")
COMPOSIO_API_KEY = getenv("COMPOSIO_API_KEY")
BASE_URL = getenv("BASE_URL", "https://openrouter.ai/api/v1")
HTTP_REFERER = getenv("HTTP_REFERER")  # Optional: for OpenRouter site rankings
X_TITLE = getenv("X_TITLE")  # Optional: for OpenRouter site rankings

if not OPENROUTER_API_KEY:
    print("[ENV] OPENROUTER_API_KEY not set in environment!")
    sys.exit(1)

# === 2. Initialize OpenAI Client ===
# Uses OpenRouter as the backend for OpenAI API calls.
client = OpenAI(
    base_url=BASE_URL,
    api_key=OPENROUTER_API_KEY,
)

# === 3. Initialize Composio ToolSet ===
# Prepares the Composio toolset for tool-augmented LLM calls.
try:
    toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)
except Exception:
    print("[INIT] Failed to initialize ComposioToolSet:")
    traceback.print_exc()
    sys.exit(1)

# === 4. Retrieve OpenAI-Compatible Tools ===
# Loads tools that can be called by the LLM via function/tool-calling.
try:
    tools = toolset.get_tools(actions=[Action.GMAIL_FETCH_EMAILS])
except Exception:
    print("[TOOLS] Failed to get Composio tools:")
    traceback.print_exc()
    sys.exit(1)

# === 5. Make a Chat Completion Call ===
# Sends a chat prompt to the LLM, requesting it to use the Gmail fetch tool.
try:
    messages = [
        {"role": "user", "content": "Fetch my latest Gmail emails"}
    ]
    extra_headers = {}
    if HTTP_REFERER:
        extra_headers["HTTP-Referer"] = HTTP_REFERER
    if X_TITLE:
        extra_headers["X-Title"] = X_TITLE
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=messages,
        tools=tools,
        extra_headers=extra_headers if extra_headers else None,
    )
except Exception:
    print("[OPENAI] OpenAI chat completion failed:")
    traceback.print_exc()
    sys.exit(1)

# The new OpenAI SDK returns a model object, not a dict. Use .model_dump() for JSON/dict.
response_json = response.model_dump()
print("[OPENAI] OpenAI chat completion response:", response_json)

# === 6. Handle Tool Calls ===
# If the LLM requested a tool/function call, execute it via Composio and print the results.
try:
    tool_call_results = toolset.handle_tool_calls(response)
    print(f"[TOOLS] Tool call results: {tool_call_results}")
except Exception:
    print("[TOOLS] Failed to handle tool calls:")
    traceback.print_exc()
    sys.exit(1)
