import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [bruteForceThreshold, setBruteForceThreshold] = useState('5');
  const [bruteForceWindow, setBruteForceWindow] = useState('5');
  const [loginStart, setLoginStart] = useState('06:00');
  const [loginEnd, setLoginEnd] = useState('22:00');
  const [alertPref, setAlertPref] = useState({
    critical: true,
    high: true,
    medium: false,
    low: false
  });
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-1">System Settings</h2>
        <p className="text-slate-400 text-sm">Configure detection thresholds and system preferences. <span className="text-xs text-amber-500 ml-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">DEMO MODE</span></p>
      </div>

      {showSaved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Configuration saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Monitoring */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Monitoring</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-200">Active Log Monitoring</div>
              <div className="text-sm text-slate-400">Continuously ingest and analyze logs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={monitoringEnabled} onChange={() => setMonitoringEnabled(!monitoringEnabled)} />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Detection Configuration */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Detection Configuration</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Brute-Force Threshold (attempts)</label>
                <input 
                  type="number" 
                  value={bruteForceThreshold}
                  onChange={(e) => setBruteForceThreshold(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time Window (minutes)</label>
                <input 
                  type="number" 
                  value={bruteForceWindow}
                  onChange={(e) => setBruteForceWindow(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Normal Login Start Time</label>
                <input 
                  type="time" 
                  value={loginStart}
                  onChange={(e) => setLoginStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Normal Login End Time</label>
                <input 
                  type="time" 
                  value={loginEnd}
                  onChange={(e) => setLoginEnd(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Preferences */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Alert Preferences</h3>
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Select which severity levels trigger dashboard notifications.</p>
            
            {['critical', 'high', 'medium', 'low'].map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={alertPref[level]}
                  onChange={() => setAlertPref({...alertPref, [level]: !alertPref[level]})}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900" 
                />
                <span className="text-sm text-slate-300 capitalize">{level} Alerts</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors shadow-sm">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
