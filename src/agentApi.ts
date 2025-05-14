// Utility for sending agent messages via backend API
export async function sendAgentMessage({
  sessionId,
  fromId,
  toId,
  message,
  toType,
  remoteUrl
}: {
  sessionId: string,
  fromId: string,
  toId: string,
  message: string,
  toType: "backend" | "remote",
  remoteUrl?: string
}) {
  const resp = await fetch("http://localhost:8000/message/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      fromId,
      toId,
      message,
      toType,
      remoteUrl
    })
  });
  if (!resp.ok) throw new Error("Failed to send message");
  return resp.json();
}

export async function fetchTelemetry(sessionId: string) {
  const resp = await fetch(`http://localhost:8000/telemetry/session/${sessionId}`);
  if (!resp.ok) throw new Error("Failed to fetch telemetry");
  return resp.json();
}
