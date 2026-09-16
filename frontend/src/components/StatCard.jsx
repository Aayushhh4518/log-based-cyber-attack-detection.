import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex items-start justify-between">
      <div>
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
