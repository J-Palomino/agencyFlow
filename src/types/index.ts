export type Message = {
  from: string; // agent id
  to: string;   // agent id
  content: string;
  timestamp: number;
};

export type AgentData = {
  id: string;
  name: string;
  company: string;
  instructions: string;
  tools: string[];
  secrets: string[];
  position?: string;
  avatar?: string;
  llmUrl?: string;
  systemPrompt?: string;
  userPrompt?: string;
  history?: Message[];
};

export type NodeData = {
  agent: AgentData;
  isSelected?: boolean;
};

export type EdgeData = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, any>;
};

export type RelationshipType = {
  id: string;
  label: string;
  color: string;
};