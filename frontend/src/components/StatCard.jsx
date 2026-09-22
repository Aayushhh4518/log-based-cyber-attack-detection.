import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass, onClick, actionLabel }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-800 rounded-lg p-6 border border-slate-700 flex items-start justify-between relative group overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-500 hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div>
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
        
        {onClick && actionLabel && (
          <div className="mt-4 flex items-center text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {actionLabel} <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg transition-colors ${colorClass} ${onClick ? 'group-hover:bg-opacity-20' : ''}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
