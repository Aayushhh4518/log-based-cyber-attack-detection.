import React from 'react';

const Header = () => {
  // Static date for now, could be dynamic
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
          <div className="text-slate-400">{currentDate}</div>
          <div className="font-medium text-slate-200">System Status: <span className="text-blue-400 ml-1">Demo Mode</span></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
