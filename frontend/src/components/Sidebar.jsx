import React from 'react';
import { LayoutDashboard, AlertTriangle, FileText, ShieldAlert, BarChart3, Settings } from 'lucide-react';
import { useApi } from '../context/ApiContext';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { backendStatus } = useApi();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'security-alerts', label: 'Security Alerts', icon: AlertTriangle },
    { id: 'log-explorer', label: 'Log Explorer', icon: FileText },
    { id: 'detection-rules', label: 'Detection Rules', icon: ShieldAlert },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  const getStatusDisplay = () => {
    if (backendStatus === 'connected') {
      return {
        dotClass: 'bg-green-500',
        textClass: 'text-green-500',
        label: 'Connected'
      };
    }
    if (backendStatus === 'disconnected') {
      return {
        dotClass: 'bg-red-500',
        textClass: 'text-red-400',
        label: 'Backend Offline'
      };
    }
    return {
      dotClass: 'bg-amber-500 animate-pulse',
      textClass: 'text-amber-400',
      label: 'Connecting...'
    };
  };

  const status = getStatusDisplay();

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <ShieldAlert className="w-8 h-8 text-blue-500 shrink-0" />
        <h1 className="font-bold text-lg text-slate-100 leading-tight">Log-Based Cyber Attack Detection</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              currentPage === item.id 
                ? 'bg-blue-600/10 text-blue-400 font-medium' 
                : 'hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setCurrentPage('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            currentPage === 'settings' 
              ? 'bg-blue-600/10 text-blue-400 font-medium' 
              : 'hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
      
      <div className="p-4 bg-slate-950 text-xs flex items-center justify-between border-t border-slate-800/60">
        <span className="text-slate-500">Backend API</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.dotClass}`}></div>
          <span className={`font-medium ${status.textClass}`}>{status.label}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
