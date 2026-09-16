import React, { useState } from 'react';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { recentAlerts } from '../data/demoData';
import { Search, Filter } from 'lucide-react';

const SecurityAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAlerts = recentAlerts.filter(alert => {
    const matchesSearch = alert.user.toLowerCase().includes(search.toLowerCase()) || 
                          alert.sourceIp.includes(search) ||
                          alert.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'All' || alert.detection === typeFilter;
    const matchesStatus = statusFilter === 'All' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search alerts (ID, IP, User)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filters:</span>
          </div>
          
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Potential Brute-Force Attack">Brute-Force</option>
            <option value="Suspicious Privilege Escalation">Privilege Escalation</option>
            <option value="Anomalous Login Time">Anomalous Login</option>
            <option value="Normal Login Activity">Normal Activity</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <AlertsTable alerts={filteredAlerts} onRowClick={setSelectedAlert} />

      {selectedAlert && (
        <AlertDetails alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
};

export default SecurityAlerts;
