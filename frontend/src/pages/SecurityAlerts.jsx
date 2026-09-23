import React, { useState, useEffect, useCallback } from 'react';
import AlertsTable from '../components/AlertsTable';
import AlertDetails from '../components/AlertDetails';
import { useApi } from '../context/ApiContext';
import { Search, Filter, Loader2, RotateCcw, WifiOff } from 'lucide-react';

const SecurityAlerts = ({ initialSeverity = 'All' }) => {
  const { API_BASE, summaryStats } = useApi();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'All') params.append('severity', severityFilter);
      if (typeFilter !== 'All') params.append('detection_type', typeFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search) params.append('search', search);
      
      const res = await fetch(`${API_BASE}/alerts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      } else {
        setError("Failed to fetch alerts from backend.");
      }
    } catch (e) {
      setError("Backend unavailable. Start FastAPI server.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, severityFilter, typeFilter, statusFilter, search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAlerts();
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [fetchAlerts, summaryStats]);

  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('All');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchAlerts}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

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
            <option value="Potential Brute-Force Attack">Potential Brute-Force</option>
            <option value="Suspicious Privilege Escalation">Suspicious Privilege Escalation</option>
            <option value="Anomalous Login Time">Anomalous Login Time</option>
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

          <button 
            onClick={clearFilters}
            className="text-sm text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchAlerts}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
            title="Refresh Alerts"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : alerts.length > 0 ? (
        <AlertsTable alerts={alerts} onRowClick={setSelectedAlert} />
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
          No alerts match your current criteria. Use the Security Simulator on the Dashboard to trigger detection rules.
        </div>
      )}

      {selectedAlert && (
        <AlertDetails alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
};

export default SecurityAlerts;
