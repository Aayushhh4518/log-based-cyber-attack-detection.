import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SecurityAlerts from './pages/SecurityAlerts';
import LogExplorer from './pages/LogExplorer';
import DetectionRules from './pages/DetectionRules';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'security-alerts': return <SecurityAlerts />;
      case 'log-explorer': return <LogExplorer />;
      case 'detection-rules': return <DetectionRules />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
