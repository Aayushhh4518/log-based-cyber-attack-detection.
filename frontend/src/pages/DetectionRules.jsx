import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Settings2, Power, Loader2, RotateCcw, WifiOff } from 'lucide-react';

const DetectionRules = () => {
  const { API_BASE, backendStatus } = useApi();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/rules`);
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      } else {
        setError("Failed to retrieve detection rules from backend.");
      }
    } catch (e) {
      setError("Backend unavailable. Start FastAPI server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [API_BASE]);

  const severityIcons = {
    Critical: <ShieldAlert className="w-4 h-4" />,
    High: <AlertTriangle className="w-4 h-4" />,
    Medium: <AlertCircle className="w-4 h-4" />,
    Low: <Info className="w-4 h-4" />
  };

  const severityColors = {
    Critical: "text-red-500",
    High: "text-amber-500",
    Medium: "text-blue-500",
    Low: "text-slate-400"
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">Detection Rules</h2>
          <p className="text-slate-400 text-sm">
            Rules evaluated by the detection engine against normalized log events. When an event pattern matches, a security alert is generated and stored in SQLite.
          </p>
        </div>
        <button
          onClick={fetchRules}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchRules}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 bg-slate-900 rounded-lg border border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-slate-400 text-sm">Loading detection rules from database...</span>
          </div>
        ) : rules.length > 0 ? (
          rules.map((rule) => {
            const config = typeof rule.config === 'string' ? JSON.parse(rule.config) : rule.config;
            return (
              <div key={rule.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col md:flex-row shadow-sm">
                
                <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${severityColors[rule.severity] || severityColors.Low}`}>
                          {severityIcons[rule.severity] || severityIcons.Low} {rule.severity}
                        </span>
                        <span className="text-slate-500 text-xs font-mono px-2 py-0.5 bg-slate-900 rounded border border-slate-800">{rule.rule_code}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{rule.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium uppercase tracking-wider">
                      <Power className="w-3 h-3" /> {rule.status}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {rule.description}
                  </p>

                  <div>
                    <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Detection Logic</h4>
                    <div className="bg-slate-950 p-3.5 rounded-md border border-slate-800 font-mono text-xs text-blue-400 overflow-x-auto">
                      {rule.logic}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 bg-slate-850 p-6 flex flex-col justify-center border-t md:border-t-0 border-slate-700">
                  <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium text-sm">
                    <Settings2 className="w-4 h-4 text-slate-400" />
                    Rule Configuration
                  </div>
                  <div className="space-y-3">
                    {config && Object.entries(config).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xs text-slate-200 font-medium bg-slate-900 px-3 py-2 rounded border border-slate-700 font-mono">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
            No detection rules found in database. Check SQLite initialization.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionRules;
