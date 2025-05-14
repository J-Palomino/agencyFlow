import React from 'react';

export default function HowToUse() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-8 prose">
      <h1>How to Use the Organization Chart Tool</h1>
      <p>Welcome! This guide will help you get started and make the most of the agentic and agent-to-agent (A2A) features.</p>
      <hr />
      <h2>1. Adding and Configuring Agents</h2>
      <ul>
        <li>Click the <strong>+</strong> button or use the UI to add a new agent node.</li>
        <li>Select an agent node and click <strong>Edit</strong> in the "LLM Config" section to configure:</li>
        <ul>
          <li><strong>Agent Type:</strong> Backend-managed (default) or Remote (A2A endpoint).</li>
          <li><strong>LLM URL:</strong> For remote agents, enter the endpoint URL. Leave blank for backend agents.</li>
          <li><strong>System Prompt/User Prompt:</strong> Customize instructions for the agent.</li>
        </ul>
        <li>Click <strong>Save</strong> to apply changes.</li>
      </ul>
      <h2>2. Connecting Agents</h2>
      <ul>
        <li>Drag from the bottom handle of one agent node to the top handle of another to create a connection.</li>
        <li>Choose the relationship type (Direct Report, Indirect, Advisory, Collaboration, etc.).</li>
        <li>Collaboration edges enable A2A communication if the target agent has an LLM URL.</li>
      </ul>
      <h2>3. Sending Messages</h2>
      <ul>
        <li>Select an agent node and use the "Send Message" form at the bottom of the details panel.</li>
        <li>Choose a recipient agent and type your message.</li>
        <li>Click <strong>Send</strong>. Messages are sent to backend agents by default, or via A2A if using Collaboration edges.</li>
        <li>Conversation history is tracked for each agent.</li>
      </ul>
      <h2>4. Telemetry &amp; Session Logging</h2>
      <ul>
        <li>All messages and actions are recorded for each session.</li>
        <li>Telemetry can be accessed via the backend for auditing, debugging, or replay.</li>
      </ul>
      <h2>5. Best Practices</h2>
      <ul>
        <li>Use backend-managed agents for most flows unless you need to integrate with external endpoints.</li>
        <li>Use Collaboration edges for agent-to-agent protocols.</li>
        <li>Keep your agent prompts and secrets up to date.</li>
      </ul>
      <h2>6. Advanced</h2>
      <ul>
        <li>Fetch and review telemetry for a session by calling the backend <code>/telemetry/session/{'{sessionId}'}</code> endpoint.</li>
        <li>Remote agents must implement a compatible A2A/ADK protocol endpoint.</li>
      </ul>
      <hr />
      <p>For more help, see the README or contact your system administrator.</p>
    </div>
  );
}
