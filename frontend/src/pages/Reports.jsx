import React from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import { useApi } from '../context/ApiContext';
import { Activity, ShieldAlert, AlertTriangle, AlertOctagon, Download } from 'lucide-react';

const Reports = () => {
  const { summaryStats } = useApi();

  const breakdown = summaryStats.detectionBreakdown || [];
  const getCount = (name) => {
    const item = breakdown.find(b => b.name === name);
    return item ? item.value : 0;
  };
  
  const bruteForceCount = getCount('Potential Brute-Force Attack');
  const privEscCount = getCount('Suspicious Privilege Escalation');
  const anomalousCount = getCount('Anomalous Login Time');

  const totalEvents = parseInt(summaryStats.totalEvents, 10) || 0;
  const totalAlerts = parseInt(summaryStats.securityAlerts, 10) || 0;
  const hasData = totalEvents > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Security Analysis Report</h2>
          <p className="text-slate-400 mt-1 text-sm">Summary of system activity and detected anomalies derived from SQLite log records.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Log Events" 
          value={totalEvents} 
          icon={Activity} 
          colorClass="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Total Alerts" 
          value={totalAlerts} 
          icon={ShieldAlert} 
          colorClass="bg-indigo-500/10 text-indigo-500" 
        />
        <StatCard 
          title="High Severity" 
          value={summaryStats.highSeverity || 0} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          title="Critical Severity" 
          value={summaryStats.criticalSeverity || 0} 
          icon={AlertOctagon} 
          colorClass="bg-red-500/10 text-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatActivityChart data={summaryStats.threatActivity || []} />
        <DetectionBreakdown data={summaryStats.detectionBreakdown || []} />
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Executive Summary</h3>
        {hasData ? (
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>
              During this analysis period, the system processed <strong className="text-slate-100">{totalEvents}</strong> log events. 
              The detection engine identified and flagged <strong className="text-slate-100">{totalAlerts}</strong> suspicious activity alerts 
              requiring SOC analyst review.
            </p>
            <p>
              Activity Breakdown: <strong className="text-red-400">{bruteForceCount} Potential Brute-Force Attack</strong> ({summaryStats.criticalSeverity || 0} Critical severity), 
              <strong className="text-amber-400"> {privEscCount} Suspicious Privilege Escalation</strong> ({summaryStats.highSeverity || 0} High severity), 
              and <strong className="text-blue-400"> {anomalousCount} Anomalous Login Time</strong> (Medium severity) finding{anomalousCount !== 1 ? 's' : ''}.
            </p>
            <p>
              Analysts are advised to review the source IPs associated with critical brute-force attempts and verify authorization for recent privilege elevation commands. 
              Out-of-hours login activity should be confirmed with the respective account owners.
            </p>
          </div>
        ) : (
          <div className="text-slate-500 text-sm py-6 text-center">
            No security events have been logged yet. Use the Security Simulator on the Dashboard to generate demonstration activity.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
