# Organization Chart Tool

An interactive, agent-based organization chart tool built with React, React Flow, Zustand, and TailwindCSS. This tool allows users to visually map, configure, and simulate communication between agents (nodes) in an organization, including agent properties, relationships, and message-passing.

## Features

- **Visual Org Chart:** Drag-and-drop interface for building and editing organization charts.
- **Custom Agent Nodes:** Each node represents an agent with editable properties (name, avatar, position, instructions, tools, secrets, and more).
- **Relationship Types:** Supports multiple relationship types (direct, collaboration, etc.) with color-coded edges.
- **Interactive Messaging:** Agents can send messages to each other, with conversation history tracked per agent.
- **LLM Integration:** Each agent can be configured with LLM (Large Language Model) endpoints and prompts.
- **State Management:** Fast, scalable state management using Zustand.
- **Modern UI:** Responsive, accessible, and visually appealing interface with TailwindCSS.

## Tech Stack

- **React** (18+)
- **React Flow** (for graph visualization)
- **Zustand** (for state management)
- **TailwindCSS** (for styling)
- **Vite** (for development/build tooling)
- **TypeScript**

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- npm or yarn

### Installation

```bash
git clone <your-repo-url>
cd agencyFlow
npm install
# or
yarn install
```

### Running the App

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
agencyFlow/
├── src/
│   ├── components/      # React components (AgentNode, OrgChart, etc.)
│   ├── store/           # Zustand store for org chart state
│   ├── types/           # TypeScript type definitions
│   ├── data/            # Initial data (nodes, edges, relationship types)
│   ├── App.tsx          # Main app container
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── ...
```

## Customization

- **Agent Properties:** Add or modify agent fields in `src/types` and `AgentNode.tsx`.
- **Relationship Types:** Edit `src/data/initialData.ts` to customize available edge types.
- **Styling:** Modify Tailwind config or component classes for custom themes.

## License

MIT (or your preferred license)
