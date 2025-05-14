import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OrgChart from './components/OrgChart';
import HowToUse from './components/HowToUse';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Organization Chart Tool
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Interactive Agent Mapping System
              </p>
              <Link
                to="/how-to-use"
                className="ml-6 text-blue-600 underline text-sm hover:text-blue-800"
              >
                How to Use
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <ReactFlowProvider>
                  <OrgChart />
                </ReactFlowProvider>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;