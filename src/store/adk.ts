// API utility for calling the backend ADK agent endpoint

export interface AdkAgentRequest {
  fromId: string;
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface AdkAgentResponse {
  reply: string;
  agentId: string;
  sessionId: string;
  context: Record<string, any>;
}

export async function callAdkAgent(
  req: AdkAgentRequest,
  backendUrl = '/adk/agent'
): Promise<AdkAgentResponse> {
  const resp = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!resp.ok) {
    throw new Error(`ADK agent error: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}
