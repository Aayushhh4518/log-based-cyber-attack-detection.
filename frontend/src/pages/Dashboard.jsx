import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { Activity, ShieldAlert, AlertTriangle, AlertOctagon, Play, RotateCcw, Loader2, CheckCircle } from 'lucide-react';
import { useDemo } from '../context/DemoContext';

const Dashboard = ({ setCurrentPage }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  // Connect to DemoContext
  const { summaryStats, alerts, isAnalyzing, runDemoAnalysis, resetDemo, demoState, settings } = useDemo();

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
  };

  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };

  // Filter alerts based on Settings preferences
  const filteredAlerts = alerts.filter(alert => {
    if (!settings || !settings.alertPref) return true;
    const severityLower = alert.severity.toLowerCase();
    return settings.alertPref[severityLower] !== false;
  });

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
          
          {demoState === 'complete' ? (
            <span className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Analysis Complete
            </span>
          ) : (
            <button 
              onClick={runDemoAnalysis}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isAnalyzing 
                  ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing demonstration logs...</>
              ) : (
                <><Play className="w-4 h-4" /> Run Security Analysis</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Log Events" 
          value={summaryStats.totalEvents} 
          icon={Activity} 
          colorClass="bg-blue-500/10 text-blue-500" 
          onClick={() => setCurrentPage('log-explorer')}
          actionLabel="View logs"
        />
        <StatCard 
          title="Security Alerts" 
          value={summaryStats.securityAlerts} 
          icon={ShieldAlert} 
          colorClass="bg-indigo-500/10 text-indigo-500" 
          onClick={() => setCurrentPage('security-alerts')}
          actionLabel="View alerts"
        />
        <StatCard 
          title="High Severity" 
          value={summaryStats.highSeverity} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500/10 text-amber-500" 
          onClick={() => setCurrentPage('security-alerts', { severity: 'High' })}
          actionLabel="View alerts"
        />
        <StatCard 
          title="Critical Severity" 
          value={summaryStats.criticalSeverity} 
          icon={AlertOctagon} 
          colorClass="bg-red-500/10 text-red-500" 
          onClick={() => setCurrentPage('security-alerts', { severity: 'Critical' })}
          actionLabel="View alerts"
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
          alerts={filteredAlerts} 
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
