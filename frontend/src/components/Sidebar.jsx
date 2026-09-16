import React from 'react';
import { LayoutDashboard, AlertTriangle, FileText, ShieldAlert, BarChart3, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col text-slate-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <ShieldAlert className="w-8 h-8 text-blue-500" />
        <h1 className="font-bold text-lg text-slate-100 leading-tight">Log-Based Cyber Attack Detection</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-600/10 text-blue-400 rounded-md">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
          <AlertTriangle className="w-5 h-5" />
          <span>Security Alerts</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
          <FileText className="w-5 h-5" />
          <span>Log Explorer</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
          <ShieldAlert className="w-5 h-5" />
          <span>Detection Rules</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
          <BarChart3 className="w-5 h-5" />
          <span>Reports</span>
        </a>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a href="#" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-md transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </a>
      </div>
      
      <div className="p-4 bg-slate-950 text-xs flex items-center justify-between">
        <span className="text-slate-500">System Status</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-green-500 font-medium">Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
