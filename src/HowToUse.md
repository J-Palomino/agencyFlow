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
