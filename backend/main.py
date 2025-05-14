from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import requests
import json
from datetime import datetime

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
    type: str  # "backend" or "remote"
    llmUrl: Optional[str] = None
    model: Optional[str] = None
    tools: Optional[list] = None
    prompts: Optional[dict] = None

class MessageRequest(BaseModel):
    sessionId: str
    fromId: str
    toId: str
    message: str
    toType: str  # "backend" or "remote"
    remoteUrl: Optional[str] = None

# --- Endpoints ---

@app.post("/agents/")
def create_or_update_agent(agent: AgentConfig):
    AGENTS[agent.id] = agent.dict()
    # If backend-managed, instantiate/update ADK agent here
    # if agent.type == "backend":
    #     AgentRegistry.register(agent.id, LlmAgent(...))
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
        # Here you'd call your ADK agent logic and get a response
        # response = AgentRegistry.get(req.toId).run(req.message)
        response = f"Simulated backend agent {req.toId} response to: {req.message}"
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

# --- CORS for local dev ---
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
