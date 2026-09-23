import React from 'react';
import { useApi } from '../context/ApiContext';
import { Wifi, WifiOff } from 'lucide-react';

const Header = () => {
  const { backendStatus } = useApi();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between text-slate-100">
      <div>
        <h2 className="text-2xl font-bold">Security Overview</h2>
        <p className="text-slate-400 mt-1">Monitor system logs and investigate suspicious security events.</p>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <div className="text-slate-400 text-xs mb-1">{currentDate}</div>
          {backendStatus === 'connected' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>System Status: <strong className="text-blue-300 font-semibold">Demo Mode</strong></span>
            </div>
          ) : backendStatus === 'disconnected' ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Backend unavailable. Start FastAPI server.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 animate-pulse">
              <span>Connecting to backend...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
