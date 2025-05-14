export type Message = {
  from: string; // agent id
  to: string;   // agent id
  content: string;
  timestamp: number;
};

export type AgentPrompt = {
  system?: string;
  user?: string;
};

export type AgentData = {
  status?: 'deployed' | 'error' | 'not_deployed';
  id: string;
  name: string;
  company: string;
  instructions: string;
  tools: (string | Record<string, any>)[];
  secrets: string[];
  position?: string;
  avatar?: string;
  llmUrl?: string;
  prompts?: AgentPrompt;
  history?: Message[];
  subAgents?: (AgentData | string)[];
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