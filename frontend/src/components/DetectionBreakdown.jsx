import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDemo } from '../context/DemoContext';

const DetectionBreakdown = () => {
  const { alerts, demoState } = useDemo();

  const chartData = useMemo(() => {
    if (demoState !== 'complete' || alerts.length === 0) {
      return [
        { name: 'Brute Force', value: 0, color: '#ef4444' },
        { name: 'Privilege Escalation', value: 0, color: '#f59e0b' },
        { name: 'Anomalous Login', value: 0, color: '#3b82f6' },
      ];
    }

    return [
      { name: 'Brute Force', value: alerts.filter(a => a.detection === 'Potential Brute-Force Attack').length, color: '#ef4444' },
      { name: 'Privilege Escalation', value: alerts.filter(a => a.detection === 'Suspicious Privilege Escalation').length, color: '#f59e0b' },
      { name: 'Anomalous Login', value: alerts.filter(a => a.detection === 'Anomalous Login Time').length, color: '#3b82f6' },
    ];
  }, [alerts, demoState]);

  const hasData = chartData.some(d => d.value > 0);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-100 mb-6">Detection Breakdown</h3>
      <div className="h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '0.375rem' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No detection data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionBreakdown;
