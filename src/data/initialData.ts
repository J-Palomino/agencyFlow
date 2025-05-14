import { AgentData, EdgeData, RelationshipType } from '../types';

// Sample agent data
export const initialAgents: AgentData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Acme Corp',
    position: 'CEO',
    instructions: 'Oversee all company operations and strategic direction',
    tools: ['Corporate Dashboard', 'Financial Analytics'],
    secrets: ['Annual Budget', 'Strategic Plans 2025'],
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    name: 'David Chen',
    company: 'Acme Corp',
    position: 'CTO',
    instructions: 'Lead technical strategy and oversee all engineering teams',
    tools: ['GitHub Admin', 'AWS Console', 'Jira'],
    secrets: ['System Architecture', 'R&D Proposals'],
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '3',
    name: 'Miguel Rodriguez',
    company: 'Acme Corp',
    position: 'CFO',
    instructions: 'Manage company finances and investor relations',
    tools: ['Financial Reporting Suite', 'Investor Portal'],
    secrets: ['Q3 Financial Report', 'Investor Meeting Notes'],
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '4',
    name: 'Priya Patel',
    company: 'Acme Corp',
    position: 'Head of Engineering',
    instructions: 'Manage engineering team and product development',
    tools: ['GitHub', 'Jira', 'CircleCI'],
    secrets: ['Product Roadmap', 'System Credentials'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '5',
    name: 'James Wilson',
    company: 'Acme Corp',
    position: 'Head of Marketing',
    instructions: 'Develop and execute marketing strategies',
    tools: ['Analytics Dashboard', 'CRM', 'Social Media Suite'],
    secrets: ['Campaign KPIs', 'Market Research'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

// Initial node positions
export const initialNodes = [
  { id: '1', type: 'agentNode', position: { x: 250, y: 0 }, data: { agent: initialAgents[0] } },
  { id: '2', type: 'agentNode', position: { x: 100, y: 150 }, data: { agent: initialAgents[1] } },
  { id: '3', type: 'agentNode', position: { x: 400, y: 150 }, data: { agent: initialAgents[2] } },
  { id: '4', type: 'agentNode', position: { x: 100, y: 300 }, data: { agent: initialAgents[3] } },
  { id: '5', type: 'agentNode', position: { x: 400, y: 300 }, data: { agent: initialAgents[4] } },
];

// Relationship types with different colors
export const relationshipTypes: RelationshipType[] = [
  { id: 'direct', label: 'Direct Report', color: '#3B82F6' },
  { id: 'indirect', label: 'Indirect Report', color: '#8B5CF6' },
  { id: 'collaboration', label: 'Collaboration', color: '#10B981' },
  { id: 'advisory', label: 'Advisory', color: '#F59E0B' },
  { id: 'mentorship', label: 'Mentorship', color: '#EC4899' },
];

// Initial edges/connections
export const initialEdges: EdgeData[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: false, label: 'Direct Report', style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: false, label: 'Direct Report', style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: false, label: 'Direct Report', style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', type: 'smoothstep', animated: false, label: 'Direct Report', style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', animated: true, label: 'Collaboration', style: { stroke: '#10B981', strokeWidth: 2, strokeDasharray: '5,5' } },
];