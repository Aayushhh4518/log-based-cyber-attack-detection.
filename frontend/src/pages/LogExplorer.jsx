import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { Search, Filter, X, Loader2, RotateCcw, WifiOff } from 'lucide-react';

const LogExplorer = () => {
  const { API_BASE, summaryStats } = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/logs?page_size=1000`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        setError("Failed to fetch logs from server.");
      }
    } catch (e) {
      setError("Backend unavailable. Start FastAPI server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [API_BASE, summaryStats]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedLog) setSelectedLog(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedLog]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.message || '').toLowerCase().includes(search.toLowerCase()) || 
                          (log.username || '').toLowerCase().includes(search.toLowerCase()) ||
                          (log.source_ip || '').includes(search) ||
                          (log.host || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || log.event_type === typeFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchLogs}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700 shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs (Message, IP, User, Host)..." 
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Event Types</option>
            <option value="Authentication">Authentication</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="VPN Login">VPN Login</option>
            <option value="System">System</option>
            <option value="Web Access">Web Access</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md py-1.5 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Blocked">Blocked</option>
            <option value="Info">Info</option>
          </select>

          <button 
            onClick={clearFilters}
            className="text-sm text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Clear Filters
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
            title="Refresh Logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-100 text-sm">Raw Normalized Log Events</h3>
          <span className="text-xs text-slate-400">{filteredLogs.length} events found</span>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-12 gap-2">
               <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
               <span className="text-slate-400 text-sm">Loading logs from SQLite...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-900 z-10 shadow-sm">
                <tr className="text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Event Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Host</th>
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium">Source IP</th>
                  <th className="px-6 py-3 font-medium w-full">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-700/40 transition-colors cursor-pointer text-slate-300 font-mono text-xs"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-3 whitespace-nowrap text-slate-400">{log.timestamp}</td>
                    <td className="px-6 py-3 whitespace-nowrap font-sans font-medium text-slate-200">{log.event_type}</td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'Success' || log.status === 'Info' ? 'text-green-400 bg-green-400/10' :
                        log.status === 'Failed' || log.status === 'Blocked' ? 'text-red-400 bg-red-400/10' :
                        'text-slate-400 bg-slate-400/10'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">{log.host || '—'}</td>
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-200">{log.username || '—'}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{log.source_ip || '—'}</td>
                    <td className="px-6 py-3 truncate max-w-md">{log.message}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-sans">
                      No logs found matching your filters. Use the Security Simulator on the Dashboard to generate events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                Log Event Details <span className="text-slate-500 font-mono text-sm">#{selectedLog.id}</span>
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-6">
                <pre className="text-slate-300 font-mono text-xs whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
              
              <div className="flex justify-end">
                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogExplorer;
