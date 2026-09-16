import React from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import { summaryStats } from '../data/demoData';
import { Activity, ShieldAlert, AlertTriangle, AlertOctagon, Download } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-lg border border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Security Analysis Report</h2>
          <p className="text-slate-400 mt-1 text-sm">Summary of system activity and detected anomalies for the current period.</p>
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
          value={summaryStats.totalEvents} 
          icon={Activity} 
          colorClass="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Total Alerts" 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreatActivityChart />
        <DetectionBreakdown />
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Executive Summary</h3>
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            During this reporting period, the system processed <strong className="text-slate-100">{summaryStats.totalEvents}</strong> raw log events. 
            The detection engine successfully identified and flagged <strong className="text-slate-100">{summaryStats.securityAlerts}</strong> suspicious activities 
            requiring analyst review.
          </p>
          <p>
            The majority of alerts were related to <strong>Potential Brute-Force Attacks</strong>, accounting for 45% of total detections. 
            There were <strong className="text-red-400">{summaryStats.criticalSeverity} Critical</strong> alerts and <strong className="text-amber-400">{summaryStats.highSeverity} High</strong> severity alerts generated, primarily focused on suspicious privilege escalation attempts outside of normal business hours.
          </p>
          <p>
            Overall threat activity peaked around 16:00 local time, correlating with the highest volume of authentication failures. 
            Analysts are advised to review the source IPs associated with the critical brute-force attempts and verify the authorization of recent privilege escalations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
