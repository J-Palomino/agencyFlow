from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

provider = "openrouter"
model = "mistral/ministral-8b"
agent_name = "openrouter_agent"
agent_instruction = "You are a helpful assistant powered by GPT-4o."
agent_description = "Agent to answer questions about the time and weather in a city."

root_agent = LlmAgent(
    model=LiteLlm(model=f"{provider}/{model}", llm_provider=provider), # LiteLLM model string format
    name=agent_name,
    instruction=agent_instruction,
    description=agent_description,
)
