import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { 
  Activity, ShieldAlert, AlertTriangle, AlertOctagon, 
  CheckCircle, XCircle, Clock, RotateCcw, Loader2, X, Terminal
} from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Dashboard = ({ setCurrentPage }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  
  const { 
    summaryStats, API_BASE, runSimulator, 
    isSimulatorRunning, activeScenario, feedbackMessage, clearFeedback 
  } = useApi();

  useEffect(() => {
    const fetchRecentAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE}/alerts?page_size=5`);
        if (res.ok) {
          const data = await res.json();
          setRecentAlerts(data);
        }
      } catch (e) {
        console.error("Failed to fetch recent alerts", e);
      }
    };
    fetchRecentAlerts();
  }, [API_BASE, summaryStats]);

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
  };

  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };

  const scenarios = [
    { id: 'normal-login', label: 'Normal Login', icon: CheckCircle, desc: '1 Successful authentication (0 alerts)' },
    { id: 'failed-login', label: 'Failed Login', icon: XCircle, desc: '1 Failed attempt (under threshold, 0 alerts)' },
    { id: 'brute-force', label: 'Brute-Force Scenario', icon: AlertOctagon, desc: '5 Failed logins in 5 min (Critical alert)' },
    { id: 'privilege-escalation', label: 'Privilege Escalation', icon: ShieldAlert, desc: 'Contextual sudo command (High alert)' },
    { id: 'anomalous-login', label: 'Anomalous Login', icon: Clock, desc: 'Off-hours login at 03:17 UTC (Medium alert)' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Security Simulator Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-slate-100">Security Simulator</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                Interactive Controls
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Generate controlled security events to demonstrate log-based detection.
            </p>
          </div>

          <button
            onClick={() => runSimulator('clear')}
            disabled={isSimulatorRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-md transition-colors text-xs font-medium border border-slate-700 disabled:opacity-50"
            title="Purge generated demonstration events while preserving detection rules"
          >
            {activeScenario === 'clear' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Clear Demo Data</span>
          </button>
        </div>

        {/* Simulator Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => runSimulator(sc.id)}
                disabled={isSimulatorRunning}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-slate-200'
                } disabled:opacity-50`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-semibold text-xs text-slate-100">{sc.label}</span>
                  {isActive ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {sc.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Message Banner */}
        {feedbackMessage && (
          <div className={`mt-4 p-3 rounded-lg flex items-center justify-between text-xs border animate-in fade-in duration-300 ${
            feedbackMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-green-500/10 border-green-500/30 text-green-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'error' ? (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button 
              onClick={clearFeedback}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Log Events" 
          value={summaryStats.totalEvents || 0} 
          icon={Activity} 
          colorClass="bg-blue-500/10 text-blue-500" 
          onClick={() => setCurrentPage('log-explorer')}
          actionLabel="View logs"
        />
        <StatCard 
          title="Security Alerts" 
          value={summaryStats.securityAlerts || 0} 
          icon={ShieldAlert} 
          colorClass="bg-indigo-500/10 text-indigo-500" 
          onClick={() => setCurrentPage('security-alerts')}
          actionLabel="View alerts"
        />
        <StatCard 
          title="High Severity" 
          value={summaryStats.highSeverity || 0} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500/10 text-amber-500" 
          onClick={() => setCurrentPage('security-alerts', { severity: 'High' })}
          actionLabel="View alerts"
        />
        <StatCard 
          title="Critical Severity" 
          value={summaryStats.criticalSeverity || 0} 
          icon={AlertOctagon} 
          colorClass="bg-red-500/10 text-red-500" 
          onClick={() => setCurrentPage('security-alerts', { severity: 'Critical' })}
          actionLabel="View alerts"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatActivityChart data={summaryStats.threatActivity || []} />
        </div>
        <div className="lg:col-span-1">
          <DetectionBreakdown data={summaryStats.detectionBreakdown || []} />
        </div>
      </div>

      {/* Alerts Table */}
      <div>
        <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Alerts</h3>
        {recentAlerts.length > 0 ? (
          <AlertsTable 
            alerts={recentAlerts} 
            onRowClick={handleRowClick} 
            onViewAllClick={() => setCurrentPage('security-alerts')}
          />
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-500">
            No security alerts have been generated yet. Use the Security Simulator above to trigger controlled detections.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <AlertDetails alert={selectedAlert} onClose={closeAlertDetails} />
      )}
    </div>
  );
};

export default Dashboard;
