from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List, Union
import uuid
import requests
import json
from datetime import datetime

# Import OpenRouter agent integration
from agent_factory import create_agent

# --- ADK imports (pseudo-code, replace with real ADK agent logic) ---
# from adk import LlmAgent, AgentRegistry

app = FastAPI()

# In-memory stores for demo (replace with DB in prod)
AGENTS: Dict[str, dict] = {}
TELEMETRY: Dict[str, list] = {}

# --- Models ---

class AgentConfig(BaseModel):
    id: str
    name: str
    company: Optional[str] = None
    instructions: Optional[str] = None
    type: str  # "backend" or "remote"
    llmUrl: Optional[str] = None
    model: Optional[str] = None
    tools: Optional[list] = None
    prompts: Optional[dict] = None
    subAgents: Optional[list] = None
    secrets: Optional[list] = None
    position: Optional[str] = None
    avatar: Optional[str] = None

class MessageRequest(BaseModel):
    sessionId: str
    fromId: str
    toId: str
    message: str
    toType: str  # "backend" or "remote"
    remoteUrl: Optional[str] = None

# --- AGENT REGISTRY ---
AGENT_REGISTRY = {}

# Register LiteLLM agent
try:
    from litellm.agent import root_agent
    AGENT_REGISTRY["openai_agent"] = root_agent
    print("[AGENT] LiteLLM agent 'openai_agent' registered in AGENT_REGISTRY.")
except Exception as e:
    print(f"[ERROR] Failed to register LiteLLM agent: {e}")

# --- Endpoints ---

class AdkAgentRequest(BaseModel):
    fromId: str
    message: str
    sessionId: Optional[str] = None
    context: Optional[dict] = None

class OpenRouterAgentConfig(BaseModel):
    id: str
    name: str
    model: str = "anthropic/claude-3-opus"
    description: Optional[str] = None
    tools: Optional[List[Union[str, Dict[str, Any]]]] = None
    prompts: Optional[Dict[str, str]] = None
    sub_agents: Optional[List[str]] = None

@app.post("/adk/agent")
def adk_agent_endpoint(req: AdkAgentRequest):
    # Route to actual backend agent if exists
    agent = AGENT_REGISTRY.get(req.fromId)
    if agent is not None:
        reply = agent.run(req.message)
        agent_id = req.fromId
    else:
        reply = f"Agent not found: {req.fromId}"
        agent_id = "unknown"
    response = {
        "reply": reply,
        "agentId": agent_id,
        "sessionId": req.sessionId or str(uuid.uuid4()),
        "context": req.context or {},
    }
    return response

@app.post("/agents/")
def create_or_update_agent(agent: AgentConfig):
    print(f"[AGENT] Received create/update request for agent: {agent.id} ({agent.name})")
    AGENTS[agent.id] = agent.dict()
    # If backend-managed, instantiate/update ADK agent here
    if agent.type == "backend":
        from adk import LlmAgent
        llm_agent = LlmAgent(
            name=agent.name,
            model=agent.model,
            description=agent.instructions,
            tools=agent.tools,
            prompts=agent.prompts,
            sub_agents=agent.subAgents
        )
        AGENT_REGISTRY[agent.id] = llm_agent
        print(f"[AGENT] Backend agent instantiated and registered: {agent.id}")
    print(f"[AGENT] Agent {agent.id} ({agent.name}) created/updated successfully.")
    return {"status": "ok", "agent": agent}

@app.post("/message/")
def send_message(req: MessageRequest):
    # Telemetry log
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "fromId": req.fromId,
        "toId": req.toId,
        "message": req.message,
        "toType": req.toType,
        "remoteUrl": req.remoteUrl,
    }
    # Route to backend or remote
    if req.toType == "backend":
        agent = AGENT_REGISTRY.get(req.toId)
        if agent is not None:
            try:
                response = agent.run(req.message)
                log_entry["response"] = response
            except Exception as e:
                log_entry["error"] = str(e)
                raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
        else:
            response = f"Agent not found: {req.toId}"
            log_entry["response"] = response
    elif req.toType == "remote" and req.remoteUrl:
        try:
            http_resp = requests.post(req.remoteUrl, json={
                "fromId": req.fromId,
                "message": req.message
            }, timeout=10)
            http_resp.raise_for_status()
            response = http_resp.json()
            log_entry["remote_response"] = response
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Invalid agent type or missing remoteUrl")

    # Store telemetry
    TELEMETRY.setdefault(req.sessionId, []).append(log_entry)
    return {"status": "ok", "log": log_entry}

@app.get("/telemetry/session/{session_id}")
def get_telemetry(session_id: str):
    return TELEMETRY.get(session_id, [])

@app.post("/openrouter/agents/")
def create_openrouter_agent(agent_config: OpenRouterAgentConfig):
    """Create a new agent using OpenRouter.
    This is a separate endpoint that doesn't modify the existing /agents/ endpoint.
    """
    try:
        # Create the OpenRouter agent
        agent = create_agent(
            agent_type="openrouter",
            agent_id=agent_config.id,
            name=agent_config.name,
            model=agent_config.model,
            description=agent_config.description,
            tools=agent_config.tools,
            prompts=agent_config.prompts,
            sub_agents=agent_config.sub_agents
        )
        
        # Register the agent in the global registry
        AGENT_REGISTRY[agent_config.id] = agent
        
        # Also store in AGENTS dict for consistency
        AGENTS[agent_config.id] = {
            "id": agent_config.id,
            "name": agent_config.name,
            "type": "backend",
            "model": agent_config.model,
            "tools": agent_config.tools,
            "prompts": agent_config.prompts,
            "subAgents": agent_config.sub_agents,
            "status": "deployed"  # Mark as deployed for UI status indicator
        }
        
        return {
            "status": "ok", 
            "message": f"OpenRouter agent {agent_config.id} created successfully",
            "agent": AGENTS[agent_config.id]
        }
    except Exception as e:
        # Mark as error for UI status indicator
        if agent_config.id in AGENTS:
            AGENTS[agent_config.id]["status"] = "error"
        
        return {
            "status": "error",
            "message": f"Failed to create OpenRouter agent: {str(e)}"
        }

# --- CORS for local dev ---
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
