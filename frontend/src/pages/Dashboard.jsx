import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { Activity, ShieldAlert, AlertTriangle, AlertOctagon, Play, RotateCcw, Loader2 } from 'lucide-react';
import { useDemo } from '../context/DemoContext';

const Dashboard = ({ setCurrentPage }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Connect to DemoContext
  const { summaryStats, alerts, isAnalyzing, runDemoAnalysis, resetDemo, demoState } = useDemo();

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
  };

  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Demo Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Security Overview</h2>
          <p className="text-sm text-slate-400">
            {demoState === 'initial' ? "System ready for analysis." : "Displaying analysis results."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {demoState === 'complete' && (
            <button 
              onClick={resetDemo}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-sm font-medium border border-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </button>
          )}
          <button 
            onClick={runDemoAnalysis}
            disabled={isAnalyzing || demoState === 'complete'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              isAnalyzing 
                ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed' 
                : demoState === 'complete'
                  ? 'bg-green-600/50 text-green-200 cursor-not-allowed border border-green-600/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            }`}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : demoState === 'complete' ? (
              <>Analysis Complete</>
            ) : (
              <><Play className="w-4 h-4" /> Run Security Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Log Events" 
          value={summaryStats.totalEvents} 
          icon={Activity} 
          colorClass="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Security Alerts" 
          value={summaryStats.securityAlerts} 
          icon={ShieldAlert} 
          colorClass="bg-indigo-500/10 text-indigo-500" 
        />
        <StatCard 
          title="High Severity" 
          value={summaryStats.highSeverity} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          title="Critical Severity" 
          value={summaryStats.criticalSeverity} 
          icon={AlertOctagon} 
          colorClass="bg-red-500/10 text-red-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatActivityChart />
        </div>
        <div className="lg:col-span-1">
          <DetectionBreakdown />
        </div>
      </div>

      {/* Alerts Table */}
      <div>
        <AlertsTable 
          alerts={alerts} 
          onRowClick={handleRowClick} 
          onViewAllClick={() => setCurrentPage('security-alerts')}
        />
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <AlertDetails alert={selectedAlert} onClose={closeAlertDetails} />
      )}
    </div>
  );
};

export default Dashboard;
