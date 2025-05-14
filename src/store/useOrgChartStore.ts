import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  Connection
} from 'reactflow';
import { initialNodes, initialEdges, relationshipTypes } from '../data/initialData';
import { AgentData, EdgeData } from '../types';

type OrgChartState = {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  showNodeForm: boolean;
  isEditing: boolean;
  relationshipTypes: { id: string; label: string; color: string }[];
  selectedRelationship: string;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNode: (nodeId: string, data: Partial<AgentData>) => void;
  addNode: (agent: AgentData) => void;
  deleteNode: (nodeId: string) => void;
  setShowNodeForm: (show: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
  updateEdge: (edgeId: string, updates: Partial<EdgeData>) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedRelationship: (relationshipId: string) => void;
  clearSelectedNode: () => void;
  sendMessage: (fromId: string, toId: string, content: string) => void;
};

const useOrgChartStore = create<OrgChartState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  showNodeForm: false,
  isEditing: false,
  relationshipTypes,
  selectedRelationship: 'direct',
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    const { selectedRelationship, relationshipTypes } = get();
    const relationshipType = relationshipTypes.find(type => type.id === selectedRelationship);
    
    const newEdge: EdgeData = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source!,
      target: connection.target!,
      type: 'smoothstep',
      animated: selectedRelationship === 'collaboration',
      label: relationshipType?.label,
      style: { 
        stroke: relationshipType?.color, 
        strokeWidth: 2,
        strokeDasharray: selectedRelationship === 'collaboration' ? '5,5' : undefined
      }
    };
    
    set({
      edges: [...get().edges, newEdge as Edge],
    });
  },
  
  setSelectedNode: (node) => {
    set({
      selectedNode: node,
      nodes: get().nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === node?.id
        }
      }))
    });
  },
  
  updateNode: (nodeId, data) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              agent: {
                ...node.data.agent,
                ...data,
                history: data.history ?? node.data.agent.history ?? [],
              }
            }
          };
        }
        return node;
      })
    });
  },
  
  addNode: (agent) => {
    const newNode = {
      id: agent.id,
      type: 'agentNode',
      position: { x: 250, y: 100 },
      data: { agent: { ...agent, history: agent.history ?? [] } }
    };
    set({
      nodes: [...get().nodes, newNode as Node]
    });
  },
  
  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter(node => node.id !== nodeId),
      edges: get().edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
      selectedNode: null
    });
  },
  
  setShowNodeForm: (show) => {
    set({ showNodeForm: show });
  },
  
  setIsEditing: (isEditing) => {
    set({ isEditing });
  },
  
  updateEdge: (edgeId, updates) => {
    set({
      edges: get().edges.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            ...updates
          };
        }
        return edge;
      })
    });
  },
  
  removeEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId)
    });
  },
  
  setSelectedRelationship: (relationshipId) => {
    set({ selectedRelationship: relationshipId });
  },
  
  clearSelectedNode: () => {
    set({
      selectedNode: null,
      nodes: get().nodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          isSelected: false
        }
      }))
    });
  },

  // Send a message from one agent to another and track in both histories
  sendMessage: (fromId, toId, content) => {
    const timestamp = Date.now();
    set({
      nodes: get().nodes.map(node => {
        if (node.id === fromId) {
          return {
            ...node,
            data: {
              ...node.data,
              agent: {
                ...node.data.agent,
                history: [
                  ...(node.data.agent.history ?? []),
                  { from: fromId, to: toId, content, timestamp }
                ]
              }
            }
          };
        } else if (node.id === toId) {
          return {
            ...node,
            data: {
              ...node.data,
              agent: {
                ...node.data.agent,
                history: [
                  ...(node.data.agent.history ?? []),
                  { from: fromId, to: toId, content, timestamp }
                ]
              }
            }
          };
        }
        return node;
      })
    });
  }
}));

export default useOrgChartStore;