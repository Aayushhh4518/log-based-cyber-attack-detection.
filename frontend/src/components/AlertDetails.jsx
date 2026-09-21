import React, { useEffect } from 'react';
import { X, ShieldAlert, Activity, User, Globe, Clock } from 'lucide-react';

const AlertDetails = ({ alert, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!alert) return null;

  const severityColors = {
    Critical: "text-red-500 bg-red-500/10",
    High: "text-amber-500 bg-amber-500/10",
    Medium: "text-blue-500 bg-blue-500/10",
    Low: "text-slate-400 bg-slate-500/10"
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${severityColors[alert.severity] || severityColors.Low}`}>
                {alert.severity} SEVERITY
              </span>
              <span className="text-slate-500 text-sm font-mono">{alert.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">{alert.detection}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300">
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4" /> <span>Timestamp</span>
              </div>
              <div className="font-medium text-slate-200">{alert.timestamp}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Activity className="w-4 h-4" /> <span>Status</span>
              </div>
              <div className="font-medium text-slate-200">{alert.status}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <User className="w-4 h-4" /> <span>Target User</span>
              </div>
              <div className="font-medium text-slate-200">{alert.user}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Globe className="w-4 h-4" /> <span>Source IP</span>
              </div>
              <div className="font-mono text-slate-200">{alert.sourceIp}</div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs">Why it was flagged</h4>
              <p className="bg-slate-800 p-4 rounded-lg text-slate-200 leading-relaxed border-l-2 border-blue-500">
                {alert.details.whyFlagged}
              </p>
            </div>

            <div>
              <h4 className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs">Evidence</h4>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-slate-300">
                <span className="text-pink-400">Events logged:</span> {alert.details.attempts}<br/>
                <span className="text-blue-400">Details:</span> {alert.details.evidence}
              </div>
            </div>

            <div>
              <h4 className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs">Recommended Action</h4>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 text-amber-200/90">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                <p>{alert.details.recommendedAction}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default AlertDetails;
