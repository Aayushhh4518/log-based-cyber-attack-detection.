import React from 'react';
import { detectionRules } from '../data/demoData';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Settings2, Power } from 'lucide-react';

const DetectionRules = () => {
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
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Detection Rules</h2>
        <p className="text-slate-400">
          These rules define the logic used to identify suspicious patterns in the incoming log data. 
          When a rule is triggered, a Security Alert is generated.
        </p>
      </div>

      <div className="grid gap-6">
        {detectionRules.map((rule) => (
          <div key={rule.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col md:flex-row">
            
            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${severityColors[rule.severity]}`}>
                      {severityIcons[rule.severity]} {rule.severity}
                    </span>
                    <span className="text-slate-500 text-xs font-mono px-2 py-0.5 bg-slate-900 rounded">{rule.id}</span>
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
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Detection Logic</h4>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-sm text-blue-400 overflow-x-auto">
                  {rule.logic}
                </div>
              </div>
            </div>

            <div className="w-full md:w-72 bg-slate-800/50 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium">
                <Settings2 className="w-4 h-4 text-slate-400" />
                Configuration
              </div>
              <div className="space-y-4">
                {Object.entries(rule.config).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs text-slate-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-sm text-slate-200 font-medium bg-slate-900 px-3 py-2 rounded border border-slate-700">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default DetectionRules;
