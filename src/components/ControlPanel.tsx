import React from 'react';
import { Edge } from 'reactflow';
import useOrgChartStore from '../store/useOrgChartStore';
import { Plus, Trash2, Edit3, Save, X, Link2 } from 'lucide-react';
import { AgentData } from '../types';

const ControlPanel: React.FC = () => {
  const {
    selectedNode,
    nodes,
    edges,
    addNode,
    deleteNode,
    updateNode,
    setShowNodeForm,
    showNodeForm,
    isEditing,
    setIsEditing,
    relationshipTypes,
    selectedRelationship,
    setSelectedRelationship,
    clearSelectedNode,
    updateEdge,
    removeEdge
  } = useOrgChartStore();
  
  const [formData, setFormData] = React.useState<Partial<AgentData>>({
    id: '',
    name: '',
    company: '',
    position: '',
    instructions: '',
    tools: [],
    secrets: []
  });
  
  const [toolInput, setToolInput] = React.useState('');
  const [secretInput, setSecretInput] = React.useState('');
  
  // Get connections for the selected node
  const nodeConnections = React.useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    
    return {
      incoming: edges.filter(edge => edge.target === selectedNode.id),
      outgoing: edges.filter(edge => edge.source === selectedNode.id)
    };
  }, [selectedNode, edges]);
  
  // Initialize form when editing
  React.useEffect(() => {
    if (selectedNode && isEditing) {
      setFormData({ ...selectedNode.data.agent });
    } else if (!isEditing) {
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        company: '',
        position: '',
        instructions: '',
        tools: [],
        secrets: []
      });
    }
  }, [selectedNode, isEditing]);
  
  const handleAddAgent = () => {
    if (formData.name && formData.company && formData.instructions) {
      addNode(formData as AgentData);
      setShowNodeForm(false);
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        company: '',
        position: '',
        instructions: '',
        tools: [],
        secrets: []
      });
    }
  };
  
  const handleUpdateAgent = () => {
    if (selectedNode && formData.name && formData.company && formData.instructions) {
      updateNode(selectedNode.id, formData);
      setIsEditing(false);
    }
  };
  
  const handleAddTool = () => {
    if (toolInput.trim()) {
      setFormData({
        ...formData,
        tools: [...(formData.tools || []), toolInput.trim()]
      });
      setToolInput('');
    }
  };
  
  const handleAddSecret = () => {
    if (secretInput.trim()) {
      setFormData({
        ...formData,
        secrets: [...(formData.secrets || []), secretInput.trim()]
      });
      setSecretInput('');
    }
  };
  
  const handleDeleteTool = (index: number) => {
    const newTools = [...(formData.tools || [])];
    newTools.splice(index, 1);
    setFormData({ ...formData, tools: newTools });
  };
  
  const handleDeleteSecret = (index: number) => {
    const newSecrets = [...(formData.secrets || [])];
    newSecrets.splice(index, 1);
    setFormData({ ...formData, secrets: newSecrets });
  };

  const handleUpdateConnection = (edge: Edge, newType: string) => {
    const relationshipType = relationshipTypes.find(type => type.id === newType);
    if (relationshipType) {
      updateEdge(edge.id, {
        label: relationshipType.label,
        style: { 
          stroke: relationshipType.color,
          strokeWidth: 2,
          strokeDasharray: newType === 'collaboration' ? '5,5' : undefined
        },
        animated: newType === 'collaboration'
      });
    }
  };
  
  return (
    <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg w-80 max-h-[calc(100vh-32px)] overflow-y-auto">
      {/* Control Panel Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-lg">
        <h2 className="font-semibold text-lg">Organization Chart Tools</h2>
      </div>
      
      {/* Relationship Type Selector */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-sm text-gray-600 mb-2 flex items-center">
          <Link2 size={16} className="mr-1" />
          Connection Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {relationshipTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedRelationship(type.id)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all
                ${selectedRelationship === type.id 
                 ? 'bg-gray-800 text-white' 
                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              style={selectedRelationship === type.id ? { backgroundColor: type.color } : {}}
            >
              {type.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select a connection type before drawing lines between nodes
        </p>
      </div>
      
      {/* Node Actions */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-sm text-gray-600 mb-2">Node Actions</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setShowNodeForm(true);
              setIsEditing(false);
              clearSelectedNode();
            }}
            className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Agent
          </button>
          
          {selectedNode && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 text-sm transition-colors"
              >
                <Edit3 size={16} className="mr-1" />
                Edit
              </button>
              
              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm transition-colors"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Form Panel */}
      {(showNodeForm || isEditing) && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">
              {isEditing ? 'Edit Agent' : 'Add New Agent'}
            </h3>
            <button
              onClick={() => {
                setShowNodeForm(false);
                setIsEditing(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agent name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agent position"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agent instructions"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tools
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tool"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTool()}
                />
                <button
                  onClick={handleAddTool}
                  className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.tools?.map((tool, index) => (
                  <div key={index} className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {tool}
                    <button
                      onClick={() => handleDeleteTool(index)}
                      className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secrets
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a secret"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSecret()}
                />
                <button
                  onClick={handleAddSecret}
                  className="px-3 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {formData.secrets?.map((secret, index) => (
                  <div key={index} className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs">
                    {secret}
                    <button
                      onClick={() => handleDeleteSecret(index)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections Management */}
            {isEditing && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Connections</h4>
                
                {/* Incoming Connections */}
                {nodeConnections.incoming.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-500 mb-2">Incoming</h5>
                    <div className="space-y-2">
                      {nodeConnections.incoming.map(edge => {
                        const sourceNode = nodes.find(n => n.id === edge.source);
                        return (
                          <div key={edge.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="text-sm">
                              From: <span className="font-medium">{sourceNode?.data.agent.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                value={relationshipTypes.find(type => type.label === edge.label)?.id}
                                onChange={(e) => handleUpdateConnection(edge, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                              >
                                {relationshipTypes.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeEdge(edge.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Outgoing Connections */}
                {nodeConnections.outgoing.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 mb-2">Outgoing</h5>
                    <div className="space-y-2">
                      {nodeConnections.outgoing.map(edge => {
                        const targetNode = nodes.find(n => n.id === edge.target);
                        return (
                          <div key={edge.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                            <div className="text-sm">
                              To: <span className="font-medium">{targetNode?.data.agent.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                value={relationshipTypes.find(type => type.label === edge.label)?.id}
                                onChange={(e) => handleUpdateConnection(edge, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                              >
                                {relationshipTypes.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => removeEdge(edge.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={isEditing ? handleUpdateAgent : handleAddAgent}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Save size={16} className="mr-1" />
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="p-4 bg-gray-50 text-gray-600 text-xs rounded-b-lg">
        <p><strong>Tips:</strong></p>
        <ul className="list-disc pl-4 space-y-1 mt-1">
          <li>Click a node to select it</li>
          <li>Drag nodes to reposition them</li>
          <li>Connect nodes by dragging from one handle to another</li>
          <li>Select connection type before creating a connection</li>
          <li>Use mouse wheel to zoom in/out</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel;