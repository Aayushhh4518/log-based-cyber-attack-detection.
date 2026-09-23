import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const DetectionBreakdown = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: 'No Data', value: 1 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-slate-100 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-slate-400" />
          Detection Breakdown
        </h3>
      </div>
      <div className="flex-1 min-h-[250px] flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-500 text-sm">No detection data available</div>
        )}
      </div>
    </div>
  );
};

export default DetectionBreakdown;
