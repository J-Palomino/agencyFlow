import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User, Briefcase, Info, PenTool as Tool, Lock, Send } from 'lucide-react';
import { NodeData } from '../types';
import useOrgChartStore from '../store/useOrgChartStore';
import { sendAgentMessage } from '../agentApi';

const AgentNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  const { agent, isSelected } = data;
  const [editConfig, setEditConfig] = useState(false);
  const [llmUrl, setLlmUrl] = useState(agent.llmUrl || '');
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || '');
  const [userPrompt, setUserPrompt] = useState(agent.userPrompt || '');
  const [message, setMessage] = useState('');
  const [toId, setToId] = useState('');

  const nodes = useOrgChartStore(state => state.nodes);
  const edges = useOrgChartStore(state => state.edges);
  const updateNode = useOrgChartStore(state => state.updateNode);
  const sendMessage = useOrgChartStore(state => state.sendMessage);

  // New: agent type selection (backend or remote)
  const [agentType, setAgentType] = useState<'backend' | 'remote'>(agent.llmUrl ? 'remote' : 'backend');

  const handleSaveConfig = () => {
    updateNode(agent.id, { llmUrl, systemPrompt, userPrompt });
    setEditConfig(false);
  };

  // New: Send message via backend API, using ADK or A2A if collaboration
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (toId && message) {
      const toNode = nodes.find(n => n.id === toId);
      const toAgent = toNode?.data.agent;
      // Determine if this is a collaboration (A2A/remote) or backend
      let toType: 'backend' | 'remote' = 'backend';
      let remoteUrl: string | undefined = undefined;
      // If edge is collaboration and llmUrl is set, treat as remote
      const edge = edges.find(e => (e.source === agent.id && e.target === toId) || (e.source === toId && e.target === agent.id));
      if (edge && edge.label === 'Collaboration' && toAgent?.llmUrl) {
        toType = 'remote';
        remoteUrl = toAgent.llmUrl;
      }
      try {
        await sendAgentMessage({
          sessionId: 'demo-session', // TODO: wire up real session id
          fromId: agent.id,
          toId,
          message,
          toType,
          remoteUrl
        });
        sendMessage(agent.id, toId, message); // preserve local history
        setMessage('');
      } catch (err) {
        alert('Failed to send message: ' + (err as Error).message);
      }
    }
  };

  return (
    <div
      className={`w-64 rounded-lg shadow-lg transition-all duration-300 overflow-hidden 
                 ${isSelected 
                   ? 'ring-4 ring-blue-500 shadow-xl scale-105 bg-white' 
                   : 'bg-white hover:shadow-xl hover:scale-102'}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500"
        isConnectable={isConnectable}
      />
      
      {/* Header with avatar and basic info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center space-x-3">
          {agent.avatar ? (
            <img 
              src={agent.avatar} 
              alt={agent.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-300 flex items-center justify-center text-blue-600 text-xl font-bold">
              {agent.name.split(' ').map(name => name[0]).join('')}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <div className="flex items-center text-blue-100 text-sm">
              <Briefcase size={14} className="mr-1" />
              <span>{agent.position || 'Agent'}</span>
            </div>
            <div className="text-xs text-blue-100">{agent.company}</div>
          </div>
        </div>
      </div>
      
      {/* Badge content - collapsed when not selected */}
      <div className={`transition-all duration-300 overflow-hidden ${isSelected ? 'max-h-96' : 'max-h-16'}`}>
        {/* Always visible summary */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center text-gray-500 text-xs">
            <Info size={14} className="mr-1 text-blue-500" />
            <span className="truncate">{agent.instructions.slice(0, 60)}...</span>
          </div>
        </div>
        
        {/* Details only visible when selected */}
        <div className="p-3 space-y-3">
          {/* LLM Config - Editable */}
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium text-gray-500 mb-1">LLM Config</div>
            <button
              className="text-xs text-blue-600 underline"
              onClick={() => setEditConfig(v => !v)}
            >
              {editConfig ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {editConfig ? (
            <div className="space-y-1">
              <label className="text-xs">Agent Type:</label>
              <select
                className="w-full text-xs border rounded px-2 py-1 mb-1"
                value={agentType}
                onChange={e => setAgentType(e.target.value as 'backend' | 'remote')}
              >
                <option value="backend">Backend-managed</option>
                <option value="remote">Remote (A2A endpoint)</option>
              </select>
              <input
                className="w-full text-xs border rounded px-2 py-1 mb-1"
                placeholder="LLM URL (for remote/A2A)"
                value={llmUrl}
                onChange={e => setLlmUrl(e.target.value)}
              />
              <input
                className="w-full text-xs border rounded px-2 py-1 mb-1"
                placeholder="System Prompt"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
              />
              <input
                className="w-full text-xs border rounded px-2 py-1 mb-1"
                placeholder="User Prompt"
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                onClick={handleSaveConfig}
              >Save</button>
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              <div><b>URL:</b> {agent.llmUrl || <span className="text-gray-400">(none)</span>}</div>
              <div><b>System:</b> {agent.systemPrompt || <span className="text-gray-400">(none)</span>}</div>
              <div><b>User:</b> {agent.userPrompt || <span className="text-gray-400">(none)</span>}</div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <Info size={14} className="mr-1 text-blue-500" />
              <span>Instructions</span>
            </div>
            <p className="text-sm text-gray-700">{agent.instructions}</p>
          </div>
          
          {/* Tools */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <Tool size={14} className="mr-1 text-blue-500" />
              <span>Tools</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.tools.map((tool, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
          
          {/* Secrets */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <Lock size={14} className="mr-1 text-blue-500" />
              <span>Secrets</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.secrets.map((secret, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full"
                >
                  {secret}
                </span>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
              <Send size={14} className="mr-1 text-blue-500" />
              <span>Conversation History</span>
            </div>
            <div className="max-h-24 overflow-y-auto bg-gray-50 rounded p-1 text-xs">
              {(agent.history && agent.history.length > 0) ? (
                agent.history.slice().reverse().map((msg, idx) => (
                  <div key={idx} className="mb-1">
                    <b>{msg.from === agent.id ? 'Me' : msg.from}</b> → <b>{msg.to === agent.id ? 'Me' : msg.to}</b>: {msg.content}
                    <span className="text-gray-400 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No messages yet.</div>
              )}
            </div>
          </div>

          {/* Send Message Form */}
          <form className="flex flex-col gap-1 mt-2" onSubmit={handleSendMessage}>
            <select
              className="text-xs border rounded px-2 py-1"
              value={toId}
              onChange={e => setToId(e.target.value)}
              required
            >
              <option value="">Send to...</option>
              {nodes.filter(n => n.id !== agent.id).map(n => (
                <option key={n.id} value={n.id}>{n.data.agent.name}</option>
              ))}
            </select>
            <div className="flex gap-1">
              <input
                className="flex-1 text-xs border rounded px-2 py-1"
                placeholder="Type a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                disabled={!toId || !message}
              >
                <Send size={14} />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500"
        isConnectable={isConnectable}
      />
    </div>
  );
});

export default AgentNode;