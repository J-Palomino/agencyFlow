from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
import uuid
import httpx
import requests  # Added for HTTP requests

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, getenv

# Import auth module
from auth import get_current_user, create_access_token, get_google_auth_url

load_dotenv()
COMPOSIO_API_KEY = getenv("COMPOSIO_API_KEY")

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
async def create_or_update_agent(
    agent: AgentConfig,
    current_user: dict = Depends(get_current_user)
):
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

@app.post("/agents/{agent_id}/message")
async def send_message(
    req: MessageRequest,
    current_user: dict = Depends(get_current_user)
):
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

@app.get("/telemetry/{session_id}")
async def get_telemetry(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    return TELEMETRY.get(session_id, [])

# --- OAuth2 Routes ---

@app.get("/auth/google/login")
async def login_via_google():
    """Generate Google OAuth URL and redirect to it"""
    return {"url": get_google_auth_url()}

@app.get("/auth/google/callback")
async def auth_callback(code: str):
    """Handle Google OAuth callback and return JWT token"""
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        'code': code,
        'client_id': getenv("GOOGLE_CLIENT_ID"),
        'client_secret': getenv("GOOGLE_CLIENT_SECRET"),
        'redirect_uri': getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback"),
        'grant_type': 'authorization_code',
    }
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=data)
        token_data = token_response.json()
        
        if 'error' in token_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=token_data['error_description']
            )
            
        # Get user info
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        userinfo_response = await client.get(userinfo_url, headers=headers)
        user_data = userinfo_response.json()
        
        # Create JWT token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_data["email"]},  # Using email as the subject
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user_data["email"],
                "name": user_data.get("name", ""),
                "picture": user_data.get("picture", "")
            }
        }

# Protected route example
@app.get("/api/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"email": current_user.email}

# composio auth
@app.post("/composio/auth")
def composio_auth(app_name: str, entity_id: str):
    """
    Authenticate with Composio API
    """
    url = "https://api.composio.dev/auth"
    headers = {
        "x-api-key": COMPOSIO_API_KEY,
        "Content-Type": "application/json"
    }
    data = {"appName": app_name, "entityId": entity_id}
    response = requests.post(url, headers=headers, json=data)
    return response.json()


# --- CORS for local dev ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
