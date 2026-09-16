import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import ThreatActivityChart from '../components/ThreatActivityChart';
import DetectionBreakdown from '../components/DetectionBreakdown';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { summaryStats, recentAlerts } from '../data/demoData';
import { Activity, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';

const Dashboard = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleRowClick = (alert) => {
    setSelectedAlert(alert);
  };

  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
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
        <AlertsTable alerts={recentAlerts} onRowClick={handleRowClick} />
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <AlertDetails alert={selectedAlert} onClose={closeAlertDetails} />
      )}
    </div>
  );
};

export default Dashboard;
