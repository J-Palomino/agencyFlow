import React, { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import useOrgChartStore from '../store/useOrgChartStore';
import AgentNode from './AgentNode';
import CustomEdge from './CustomEdge';
import ControlPanel from './ControlPanel';

const OrgChart: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    clearSelectedNode
  } = useOrgChartStore();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(() => ({
    agentNode: AgentNode,
  }), []);
  
  // Define custom edge types
  const edgeTypes: EdgeTypes = useMemo(() => ({
    default: CustomEdge,
  }), []);
  
  // Handle node click
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);
  
  // Handle background click to deselect node
  const onPaneClick = useCallback(() => {
    clearSelectedNode();
  }, [clearSelectedNode]);
  
  return (
    <div className="w-full h-screen bg-slate-50" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          className="bg-slate-50"
        >
          <Background color="#94a3b8" gap={24} size={1} />
          <Controls position="bottom-left" showInteractive={false} className="bg-white shadow-md rounded-md" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-white shadow-md rounded-md border border-gray-200"
            nodeBorderRadius={8}
            nodeColor={(node) => {
              return node.data?.isSelected ? '#3b82f6' : '#94a3b8';
            }}
          />
          <ControlPanel />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default OrgChart;