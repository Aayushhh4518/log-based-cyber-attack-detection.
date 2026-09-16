import React from 'react';
import { recentAlerts } from '../data/demoData';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const SeverityBadge = ({ severity }) => {
  const styles = {
    Critical: "bg-red-500/10 text-red-500 border-red-500/20",
    High: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Low: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const icons = {
    Critical: <ShieldAlert className="w-3 h-3 mr-1" />,
    High: <AlertTriangle className="w-3 h-3 mr-1" />,
    Medium: <AlertCircle className="w-3 h-3 mr-1" />,
    Low: <Info className="w-3 h-3 mr-1" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[severity] || styles.Low}`}>
      {icons[severity] || icons.Low}
      {severity}
    </span>
  );
};

const AlertsTable = ({ onRowClick }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100">Recent Security Alerts</h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Detection</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Source IP</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {recentAlerts.map((alert) => (
              <tr 
                key={alert.id} 
                className="hover:bg-slate-700/30 transition-colors cursor-pointer text-slate-300"
                onClick={() => onRowClick(alert)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-6 py-4 font-medium text-slate-200">{alert.detection}</td>
                <td className="px-6 py-4">{alert.user}</td>
                <td className="px-6 py-4 font-mono text-xs">{alert.sourceIp}</td>
                <td className="px-6 py-4 text-slate-400">{alert.timestamp}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    alert.status === 'New' ? 'bg-indigo-500/10 text-indigo-400' :
                    alert.status === 'Investigating' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;
